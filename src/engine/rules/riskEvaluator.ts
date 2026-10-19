import type {
  ConfusableAnalysis,
  DetectionResult,
  Finding,
  ParsedHostname,
  SimilarityMatch,
  Verdict,
} from '../types'
import {
  findBrandByOfficialDomain,
  getSafeOfficialDestination,
} from '../brands/officialCatalog'

const SUSPICIOUS_ABUSED_TLDS = new Set([
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'top',
  'xyz',
  'work',
  'click',
  'fit',
])

function isPrivateIp(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return true
  }
  return false
}

interface EvaluatorInput {
  parsed: ParsedHostname
  confusableAnalysis: ConfusableAnalysis
  similarityMatches: SimilarityMatch[]
  isAllowlisted?: boolean
}

/**
 * Deterministically evaluates host findings into an explainable risk score and verdict.
 * Unfamiliar domains remain UNKNOWN unless meaningful suspicious indicators are detected.
 */
export function evaluateRisk({
  parsed,
  confusableAnalysis,
  similarityMatches,
  isAllowlisted = false,
}: EvaluatorInput): DetectionResult {
  const findings: Finding[] = []
  let score = 0
  let confidence = 0.5
  const analyzedAt = new Date().toISOString()

  // 1. User Allowlist Override
  if (isAllowlisted) {
    findings.push({
      id: 'find-allowlist',
      category: 'allowlist',
      severity: 'info',
      title: 'Trusted Allowlist Override',
      description: 'Domain is in your personal trusted allowlist.',
    })
    return {
      parsed,
      verdict: 'LOW_RISK',
      riskScore: 5,
      confidence: 1.0,
      summary: 'Domain is on your personal trusted allowlist. Warnings bypassed.',
      recommendedOfficialUrl: null,
      recommendedAction: 'PROCEED',
      findings,
      confusableAnalysis,
      similarityMatches: [],
      threatIntelStatus: 'OFFLINE_ONLY',
      analyzedAt,
    }
  }

  // 2. Unsupported Schemes
  if (parsed.isUnsupportedScheme) {
    findings.push({
      id: 'find-unsupported-scheme',
      category: 'unsupported_scheme',
      severity: 'low',
      title: 'Unsupported Protocol Scheme',
      description: `Protocol scheme "${parsed.parseError}" is not an external web domain.`,
    })
    return {
      parsed,
      verdict: 'UNKNOWN',
      riskScore: 0,
      confidence: 0.9,
      summary: 'Browser internal or unsupported protocol scheme.',
      recommendedOfficialUrl: null,
      recommendedAction: 'NO_ACTION',
      findings,
      confusableAnalysis,
      similarityMatches: [],
      threatIntelStatus: 'OFFLINE_ONLY',
      analyzedAt,
    }
  }

  // 3. Malformed / Unparseable Input
  if (parsed.isMalformed || !parsed.hostname) {
    findings.push({
      id: 'find-malformed',
      category: 'malformed',
      severity: 'medium',
      title: 'Malformed Hostname Syntax',
      description: parsed.parseError || 'Could not parse hostname from input string.',
    })
    return {
      parsed,
      verdict: 'UNKNOWN',
      riskScore: 30,
      confidence: 0.8,
      summary: 'Input format is malformed or invalid.',
      recommendedOfficialUrl: null,
      recommendedAction: 'NO_ACTION',
      findings,
      confusableAnalysis,
      similarityMatches: [],
      threatIntelStatus: 'OFFLINE_ONLY',
      analyzedAt,
    }
  }

  // 4. Verified Official Brand Domain
  const verifiedBrand = findBrandByOfficialDomain(parsed.registrableDomain)
  if (verifiedBrand) {
    findings.push({
      id: 'find-official-brand',
      category: 'official_domain',
      severity: 'info',
      title: `Verified Official Domain: ${verifiedBrand.name}`,
      description: `Domain matches an official registered domain in our verified brand catalog (${parsed.registrableDomain}).`,
      evidence: {
        brandId: verifiedBrand.id,
        primaryDomain: verifiedBrand.primaryDomain,
      },
    })
    return {
      parsed,
      verdict: 'LOW_RISK',
      riskScore: 5,
      confidence: 0.98,
      summary: `Verified official domain for ${verifiedBrand.name}.`,
      impersonatedBrand: verifiedBrand,
      recommendedOfficialUrl: getSafeOfficialDestination(verifiedBrand),
      recommendedAction: 'PROCEED',
      findings,
      confusableAnalysis,
      similarityMatches: [],
      threatIntelStatus: 'OFFLINE_ONLY',
      analyzedAt,
    }
  }

  // 5. Direct IP Address Navigation
  if (parsed.isIp) {
    if (isPrivateIp(parsed.hostname)) {
      findings.push({
        id: 'find-private-ip',
        category: 'ip_direct',
        severity: 'info',
        title: 'Local / Private IP Address',
        description: 'Host resolves to a local or private network address.',
      })
      score += 5
    } else {
      findings.push({
        id: 'find-public-ip',
        category: 'ip_direct',
        severity: 'medium',
        title: 'Direct Public IP Navigation',
        description:
          'Navigating directly to a public IP address bypasses domain registration and SSL brand verification.',
      })
      score += 50
    }
  }

  // 6. Brand Lookalike / Impersonation Matches
  let primaryBrandMatch: SimilarityMatch | undefined
  if (similarityMatches.length > 0) {
    // Sort by highest similarity
    const sorted = [...similarityMatches].sort(
      (a, b) => b.similarityScore - a.similarityScore
    )
    primaryBrandMatch = sorted[0]

    for (const match of sorted) {
      switch (match.technique) {
        case 'homoglyph_skeleton':
          findings.push({
            id: `find-homoglyph-${match.brand.id}`,
            category: 'homoglyph',
            severity: 'critical',
            title: `Homoglyph Spoof of ${match.brand.name}`,
            description: match.explanation,
            evidence: {
              brand: match.brand.name,
              targetDomain: match.matchedTargetDomain,
              skeleton: confusableAnalysis.skeleton,
            },
          })
          score += 85
          confidence = 0.95
          break

        case 'subdomain_brand_spoof':
          findings.push({
            id: `find-subdomain-${match.brand.id}`,
            category: 'subdomain_spoof',
            severity: 'critical',
            title: `Subdomain Impersonation of ${match.brand.name}`,
            description: match.explanation,
            evidence: {
              brand: match.brand.name,
              subdomain: parsed.subdomain,
              unrelatedRegistrableDomain: parsed.registrableDomain,
            },
          })
          score += 80
          confidence = 0.95
          break

        case 'hyphen_insertion':
        case 'embedded_brand_token':
          findings.push({
            id: `find-embedded-${match.brand.id}`,
            category: 'embedded_brand',
            severity: 'high',
            title: `Brand Keyword Stacking (${match.brand.name})`,
            description: match.explanation,
            evidence: {
              brand: match.brand.name,
              matchedToken: match.matchedToken,
            },
          })
          score += 65
          confidence = 0.88
          break

        case 'substitution':
        case 'transposition':
        case 'insertion':
        case 'deletion':
          findings.push({
            id: `find-typosquat-${match.brand.id}`,
            category: 'typosquat',
            severity: 'high',
            title: `Typosquatting Mimicry of ${match.brand.name}`,
            description: match.explanation,
            evidence: {
              brand: match.brand.name,
              technique: match.technique,
              distance: match.distance,
            },
          })
          score += 60
          confidence = 0.85
          break

        case 'repeated_char':
          findings.push({
            id: `find-repeated-${match.brand.id}`,
            category: 'typosquat',
            severity: 'medium',
            title: `Character Stretch Typosquat of ${match.brand.name}`,
            description: match.explanation,
          })
          score += 45
          confidence = 0.8
          break
      }
    }
  }

  // 7. General Mixed-Script / Confusable Characters (not targeting a known brand)
  if (!primaryBrandMatch) {
    if (confusableAnalysis.isMixedScript) {
      findings.push({
        id: 'find-mixed-script',
        category: 'homoglyph',
        severity: 'high',
        title: 'Mixed Script Domain Encoding',
        description: `Domain contains mixed scripts (${confusableAnalysis.scripts.join(', ')}). This technique is frequently used to disguise deceptive letters.`,
      })
      score += 55
      confidence = 0.82
    } else if (confusableAnalysis.containsConfusables && confusableAnalysis.isPunycode) {
      findings.push({
        id: 'find-punycode-confusable',
        category: 'punycode',
        severity: 'medium',
        title: 'Punycode Internationalized Characters',
        description:
          'Domain uses Punycode character encoding with visually confusable characters.',
      })
      score += 35
      confidence = 0.7
    }
  }

  // 8. TLD Risk Evaluation
  if (
    parsed.publicSuffix &&
    SUSPICIOUS_ABUSED_TLDS.has(parsed.publicSuffix.toLowerCase())
  ) {
    findings.push({
      id: 'find-suspicious-tld',
      category: 'tld_risk',
      severity: 'medium',
      title: 'Elevated Abuse Rate TLD',
      description: `Top-level domain ".${parsed.publicSuffix}" has elevated rates of transient phishing registrations.`,
    })
    score += 20
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score))

  // Determine typed verdict
  let verdict: Verdict
  let recommendedAction: DetectionResult['recommendedAction']
  let summary: string

  if (finalScore >= 75) {
    verdict = 'MALICIOUS'
    recommendedAction = 'WARN_USER'
    summary = primaryBrandMatch
      ? `High-risk lookalike domain impersonating ${primaryBrandMatch.brand.name}.`
      : 'High-risk deception markers detected on this domain.'
  } else if (finalScore >= 45) {
    verdict = 'SUSPICIOUS'
    recommendedAction = 'WARN_USER'
    summary = primaryBrandMatch
      ? `Suspicious similarity detected targeting ${primaryBrandMatch.brand.name}.`
      : 'Suspicious structural anomalies or deceptive character combinations detected.'
  } else {
    // Unfamiliar domain with no significant threat indicators
    verdict = 'UNKNOWN'
    recommendedAction = 'NO_ACTION'
    confidence = 0.3
    summary =
      'Unfamiliar domain. No specific lookalike, punycode spoof, or impersonation markers detected in local analysis.'
  }

  const recommendedOfficialUrl = primaryBrandMatch
    ? getSafeOfficialDestination(primaryBrandMatch.brand)
    : null

  return {
    parsed,
    verdict,
    riskScore: finalScore,
    confidence,
    summary,
    impersonatedBrand: primaryBrandMatch?.brand,
    recommendedOfficialUrl,
    recommendedAction,
    findings,
    confusableAnalysis,
    similarityMatches,
    threatIntelStatus: 'OFFLINE_ONLY',
    analyzedAt,
  }
}
