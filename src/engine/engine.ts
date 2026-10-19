import type { DetectionResult, OfficialBrand } from './types'
import type { ThreatIntelCache, ThreatIntelProvider } from './reputation/types'
import { parseHostname } from './parser/hostnameParser'
import { analyzeConfusables } from './confusables/unicodeConfusables'
import { detectTyposquattingAndImpersonation } from './similarity/typosquattingDetector'
import { evaluateRisk } from './rules/riskEvaluator'
import { OFFICIAL_BRANDS } from './brands/officialCatalog'
import { NullThreatIntelProvider } from './reputation/nullProvider'
import { MemoryThreatIntelCache } from './reputation/memoryCache'

export interface EngineOptions {
  threatIntelProvider?: ThreatIntelProvider
  threatIntelCache?: ThreatIntelCache
  brands?: OfficialBrand[]
  enableExternalLookups?: boolean
}

export interface AnalyzeOptions {
  isAllowlisted?: boolean
  checkThreatIntel?: boolean
  timeoutMs?: number
  signal?: AbortSignal
}

/**
 * Voltrex Cosmos — Domain Intelligence & Detection Engine
 *
 * Fully decoupled from React and Chrome extension APIs.
 * Pure TypeScript deterministic engine.
 */
export class DomainIntelligenceEngine {
  private provider: ThreatIntelProvider
  private cache: ThreatIntelCache
  private brands: OfficialBrand[]
  private enableExternalLookups: boolean

  constructor(options: EngineOptions = {}) {
    this.provider = options.threatIntelProvider || new NullThreatIntelProvider()
    this.cache = options.threatIntelCache || new MemoryThreatIntelCache()
    this.brands = options.brands || OFFICIAL_BRANDS
    this.enableExternalLookups = options.enableExternalLookups ?? false
  }

  /**
   * Deterministically analyzes a URL or domain string.
   */
  async analyze(
    rawInput: string,
    options: AnalyzeOptions = {}
  ): Promise<DetectionResult> {
    // 1. Safe WHATWG Hostname & PSL Parsing
    const parsed = parseHostname(rawInput)

    // 2. Unicode Confusable & Mixed-Script Analysis
    const confusableAnalysis = analyzeConfusables(
      parsed.displayHostname || parsed.hostname
    )

    // 3. Typosquatting & Brand Impersonation Detection
    const similarityMatches = detectTyposquattingAndImpersonation(
      parsed,
      confusableAnalysis,
      this.brands
    )

    // 4. Deterministic Risk Evaluation & Scoring
    const result = evaluateRisk({
      parsed,
      confusableAnalysis,
      similarityMatches,
      isAllowlisted: options.isAllowlisted ?? false,
    })

    // 5. Threat Intelligence Integration (if explicitly enabled)
    if (
      this.enableExternalLookups &&
      options.checkThreatIntel &&
      parsed.registrableDomain
    ) {
      try {
        const domainToQuery = parsed.registrableDomain

        // Check local cache first
        const cached = await this.cache.get(domainToQuery)
        if (cached) {
          result.threatIntelStatus = 'CACHED'
          if (cached.reputationVerdict === 'malicious') {
            result.riskScore = Math.max(result.riskScore, 90)
            result.verdict = 'MALICIOUS'
            result.findings.push({
              id: 'find-reputation-cached',
              category: 'tld_risk',
              severity: 'critical',
              title: 'External Intelligence Match (Cached)',
              description: `Reported as malicious by ${cached.source}.`,
            })
          }
        } else {
          // Query provider with timeout
          const intel = await this.provider.lookupDomain(domainToQuery, {
            timeoutMs: options.timeoutMs,
            signal: options.signal,
          })

          if (intel.isAvailable) {
            result.threatIntelStatus = 'QUERIED'
            await this.cache.set(domainToQuery, intel)

            if (intel.reputationVerdict === 'malicious') {
              result.riskScore = Math.max(result.riskScore, 90)
              result.verdict = 'MALICIOUS'
              result.findings.push({
                id: 'find-reputation-external',
                category: 'tld_risk',
                severity: 'critical',
                title: 'External Intelligence Match',
                description: `Domain identified in malicious threat feeds (${intel.source}).`,
              })
            }
          } else {
            result.threatIntelStatus = 'UNAVAILABLE'
          }
        }
      } catch {
        result.threatIntelStatus = 'UNAVAILABLE'
      }
    }

    return result
  }

  /**
   * Retrieves provider status.
   */
  async getProviderStatus() {
    return this.provider.getStatus()
  }
}

// Export singleton instance with default offline configuration
export const defaultDomainEngine = new DomainIntelligenceEngine()
