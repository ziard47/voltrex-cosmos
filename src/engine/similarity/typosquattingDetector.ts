import type {
  ConfusableAnalysis,
  OfficialBrand,
  ParsedHostname,
  SimilarityMatch,
} from '../types'
import { OFFICIAL_BRANDS, isOfficialDomain } from '../brands/officialCatalog'
import { damerauLevenshteinDistance } from './damerauLevenshtein'

const SENSITIVE_PHISHING_KEYWORDS = [
  'login',
  'signin',
  'sign-in',
  'account',
  'security',
  'verify',
  'verification',
  'portal',
  'auth',
  'authenticate',
  'secure',
  'update',
  'recover',
  'recovery',
  'password',
  'billing',
  'wallet',
]

/**
 * Checks if a string has repeated consecutive characters compared to a target.
 */
function isRepeatedCharVariant(candidate: string, target: string): boolean {
  if (candidate === target) return false
  // Collapse consecutive duplicates
  const collapsedCandidate = candidate.replace(/(.)\1+/g, '$1')
  const collapsedTarget = target.replace(/(.)\1+/g, '$1')
  return collapsedCandidate === collapsedTarget
}

/**
 * Detects whether a candidate token is a digit-substitution variant of target (e.g., g00gle -> google).
 */
function isDigitSubstitution(candidate: string, target: string): boolean {
  if (candidate === target) return false
  const deLeeted = candidate
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/8/g, 'b')

  return deLeeted === target
}

function isAdjacentTransposition(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false
  const diffs: number[] = []
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) diffs.push(i)
  }
  return (
    diffs.length === 2 &&
    diffs[0] !== undefined &&
    diffs[1] !== undefined &&
    diffs[1] - diffs[0] === 1 &&
    s1[diffs[0]] === s2[diffs[1]] &&
    s1[diffs[1]] === s2[diffs[0]]
  )
}

/**
 * Analyzes a parsed hostname against the official brand catalog for
 * brand impersonation, typosquatting, subdomain spoofing, and embedded brand names.
 */
export function detectTyposquattingAndImpersonation(
  parsed: ParsedHostname,
  confusableAnalysis: ConfusableAnalysis,
  brands: OfficialBrand[] = OFFICIAL_BRANDS
): SimilarityMatch[] {
  // If input is malformed, IP address, or unsupported, skip brand lookalike check
  if (parsed.isMalformed || parsed.isIp || !parsed.registrableDomain) {
    return []
  }

  // If this registrable domain is already a verified official domain for a brand, it's authentic!
  if (isOfficialDomain(parsed.registrableDomain)) {
    return []
  }

  const matches: SimilarityMatch[] = []
  const domainLabel = (parsed.domainWithoutSuffix || '').toLowerCase()
  const skeletonLabel = confusableAnalysis.skeleton.split('.')[0] || ''
  const subdomain = (parsed.subdomain || '').toLowerCase()

  for (const brand of brands) {
    // 1. Homoglyph / Confusable skeleton match
    for (const token of brand.brandTokens) {
      if (
        confusableAnalysis.containsConfusables &&
        (skeletonLabel === token || skeletonLabel.includes(token))
      ) {
        matches.push({
          brand,
          matchedTargetDomain: brand.primaryDomain,
          technique: 'homoglyph_skeleton',
          distance: 0,
          matchedToken: token,
          similarityScore: 0.98,
          explanation: `Visual homoglyph spoof: Hostname resolves to brand "${brand.name}" when decoded from internationalized/confusable characters.`,
        })
        break
      }
    }

    // 2. Subdomain brand spoof (e.g. paypal.com.attacker.net or apple.verify.badsite.org)
    for (const token of brand.brandTokens) {
      if (
        subdomain &&
        (subdomain === token ||
          subdomain.startsWith(`${token}.`) ||
          subdomain.endsWith(`.${token}`) ||
          subdomain.includes(`${token}.com`))
      ) {
        matches.push({
          brand,
          matchedTargetDomain: brand.primaryDomain,
          technique: 'subdomain_brand_spoof',
          distance: 0,
          matchedToken: token,
          similarityScore: 0.95,
          explanation: `Subdomain spoofing: Contains brand name "${brand.name}" in subdomain on an unrelated domain ("${parsed.registrableDomain}").`,
        })
        break
      }
    }

    // 3. Brand name embedded in unrelated registrable domain (e.g., "paypal-login-secure.com")
    for (const token of brand.brandTokens) {
      if (domainLabel.includes(token) && domainLabel !== token) {
        const hasKeyword = SENSITIVE_PHISHING_KEYWORDS.some((kw) =>
          domainLabel.includes(kw)
        )
        const hasHyphen =
          domainLabel.includes(`-${token}`) || domainLabel.includes(`${token}-`)

        if (hasKeyword || hasHyphen) {
          matches.push({
            brand,
            matchedTargetDomain: brand.primaryDomain,
            technique: hasHyphen ? 'hyphen_insertion' : 'embedded_brand_token',
            distance: 0,
            matchedToken: token,
            similarityScore: hasKeyword ? 0.92 : 0.82,
            explanation: `Brand keyword lure: Combines brand name "${brand.name}" with suspicious prefixes or authentication keywords on an unofficial domain.`,
          })
          break
        }
      }
    }

    // 4. Typosquatting on the registrable domain label
    for (const token of brand.brandTokens) {
      // Check digit substitution (e.g. g00gle -> google)
      if (isDigitSubstitution(domainLabel, token)) {
        matches.push({
          brand,
          matchedTargetDomain: brand.primaryDomain,
          technique: 'substitution',
          distance: 1,
          matchedToken: token,
          similarityScore: 0.92,
          explanation: `Digit substitution: Replaces characters with numbers to mimic brand "${brand.name}" (e.g. 0 for o, 1 for l).`,
        })
        break
      }

      // Check repeated characters (e.g. gooogle -> google)
      if (isRepeatedCharVariant(domainLabel, token)) {
        matches.push({
          brand,
          matchedTargetDomain: brand.primaryDomain,
          technique: 'repeated_char',
          distance: Math.abs(domainLabel.length - token.length),
          matchedToken: token,
          similarityScore: 0.88,
          explanation: `Repeated character typosquat: Stretches repeated characters to mimic brand "${brand.name}".`,
        })
        break
      }

      // Calculate Damerau-Levenshtein distance
      // Only test labels of comparable length to avoid false positives (e.g. "app" vs "apple")
      if (Math.abs(domainLabel.length - token.length) <= 2 && domainLabel.length >= 4) {
        const dist = damerauLevenshteinDistance(domainLabel, token)

        if (dist === 1) {
          // Identify specific technique
          let technique: SimilarityMatch['technique']
          let explanation: string

          if (domainLabel.length > token.length) {
            technique = 'insertion'
            explanation = `Single character insertion typosquatting brand "${brand.name}".`
          } else if (domainLabel.length < token.length) {
            technique = 'deletion'
            explanation = `Single character omission/deletion typosquatting brand "${brand.name}".`
          } else {
            const isTransposition = isAdjacentTransposition(domainLabel, token)
            technique = isTransposition ? 'transposition' : 'substitution'
            explanation = isTransposition
              ? `Adjacent character transposition typosquatting brand "${brand.name}".`
              : `Single character substitution typosquatting brand "${brand.name}".`
          }

          matches.push({
            brand,
            matchedTargetDomain: brand.primaryDomain,
            technique,
            distance: dist,
            matchedToken: token,
            similarityScore: 0.9,
            explanation,
          })
          break
        }
      }
    }
  }

  // Deduplicate matches per brand, keeping highest similarity score
  const brandBestMap = new Map<string, SimilarityMatch>()
  for (const match of matches) {
    const existing = brandBestMap.get(match.brand.id)
    if (!existing || match.similarityScore > existing.similarityScore) {
      brandBestMap.set(match.brand.id, match)
    }
  }

  return Array.from(brandBestMap.values())
}
