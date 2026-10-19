import { defaultDomainEngine } from '@/engine'
import type { DomainAnalysis, RiskLevel, SecurityIndicator } from '@/types/domain'
import { storageService } from './storageService'

function mapVerdictToRiskLevel(verdict: string): RiskLevel {
  switch (verdict) {
    case 'MALICIOUS':
      return 'malicious'
    case 'SUSPICIOUS':
      return 'suspicious'
    case 'LOW_RISK':
      return 'low_risk'
    case 'UNKNOWN':
    default:
      return 'unknown'
  }
}

export const detectionService = {
  /**
   * Evaluates a domain or URL using the deterministic Phase 2 Domain Intelligence Engine.
   */
  async analyzeDomain(rawInput: string): Promise<DomainAnalysis> {
    if (!rawInput) {
      return {
        url: '',
        hostname: '',
        normalizedHostname: '',
        isPunycode: false,
        riskLevel: 'unknown',
        riskScore: 0,
        statusExplanation: 'No hostname provided',
        indicators: [],
        verifiedOfficialUrl: null,
        analyzedAt: new Date().toISOString(),
        analysisSource: 'local_heuristics',
        isMockVerdict: false,
      }
    }

    // Check user settings and allowlist from storage
    const settings = await storageService.getSettings()
    const isAllowlisted = await storageService.isAllowlisted(rawInput)

    // Run engine analysis
    const engineResult = await defaultDomainEngine.analyze(rawInput, {
      isAllowlisted,
      checkThreatIntel: settings.threatIntelEnabled,
    })

    // Map structured engine findings to UI security indicators
    const indicators: SecurityIndicator[] = engineResult.findings.map((f) => ({
      id: f.id,
      category: f.category as SecurityIndicator['category'],
      severity: f.severity,
      title: f.title,
      description: f.description,
      detectedValue: f.evidence
        ? Object.entries(f.evidence)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(' | ')
        : undefined,
    }))

    // Determine whether finding originates from local heuristics, threat intelligence, or hybrid
    const hasExternalFinding = engineResult.findings.some(
      (f) =>
        f.id.startsWith('find-reputation') || f.title.includes('External Intelligence')
    )
    const hasLocalFinding = engineResult.findings.some(
      (f) =>
        !f.id.startsWith('find-reputation') && !f.title.includes('External Intelligence')
    )

    let analysisSource: 'local_heuristics' | 'threat_intelligence' | 'hybrid' =
      'local_heuristics'
    if (hasExternalFinding && hasLocalFinding) {
      analysisSource = 'hybrid'
    } else if (hasExternalFinding) {
      analysisSource = 'threat_intelligence'
    }

    return {
      url: engineResult.parsed.rawInput,
      hostname: engineResult.parsed.hostname,
      normalizedHostname:
        engineResult.parsed.registrableDomain || engineResult.parsed.hostname,
      isPunycode: engineResult.parsed.isIdn,
      punycodeDecoded: engineResult.parsed.displayHostname,
      riskLevel: mapVerdictToRiskLevel(engineResult.verdict),
      riskScore: engineResult.riskScore,
      statusExplanation: engineResult.summary,
      targetBrand: engineResult.impersonatedBrand?.name,
      indicators,
      verifiedOfficialUrl: engineResult.recommendedOfficialUrl,
      analyzedAt: engineResult.analyzedAt,
      analysisSource,
      isMockVerdict: false,
    }
  },
}
