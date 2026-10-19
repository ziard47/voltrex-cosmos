/**
 * Voltrex Cosmos — Domain Intelligence & Detection Engine Types
 */

export type Verdict = 'UNKNOWN' | 'LOW_RISK' | 'SUSPICIOUS' | 'MALICIOUS'

export type FindingCategory =
  | 'homoglyph'
  | 'punycode'
  | 'typosquat'
  | 'subdomain_spoof'
  | 'embedded_brand'
  | 'tld_risk'
  | 'entropy'
  | 'ip_direct'
  | 'unsupported_scheme'
  | 'malformed'
  | 'allowlist'
  | 'official_domain'

export type FindingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export interface Finding {
  id: string
  category: FindingCategory
  severity: FindingSeverity
  title: string
  description: string
  evidence?: Record<string, unknown>
}

export interface ParsedHostname {
  /** Original raw input before parsing */
  rawInput: string
  /** Normalized ASCII/Punycode hostname (lowercase, no port, no trailing dot) */
  hostname: string
  /** Decoded Unicode hostname for human display */
  displayHostname: string
  /** Registrable domain (e.g., "google.co.uk", "paypal.com") based on Public Suffix List */
  registrableDomain: string | null
  /** Decoded Unicode registrable domain */
  displayRegistrableDomain: string | null
  /** Subdomain portion (e.g., "accounts.verify" in "accounts.verify.google.com") */
  subdomain: string | null
  /** Public suffix portion (e.g., "co.uk", "com", "org") */
  publicSuffix: string | null
  /** Domain name without public suffix (e.g., "google" in "google.co.uk") */
  domainWithoutSuffix: string | null
  /** Is this an IP address (IPv4 or IPv6)? */
  isIp: boolean
  isIpv4: boolean
  isIpv6: boolean
  /** Is Internationalized Domain Name (Punycode / non-ASCII) */
  isIdn: boolean
  /** True if input URL scheme is unsupported (e.g. javascript:, data:, file:) */
  isUnsupportedScheme: boolean
  /** True if hostname was unparseable or completely invalid */
  isMalformed: boolean
  /** Any syntax or parsing error message */
  parseError?: string
}

export interface OfficialBrand {
  id: string
  name: string
  category:
    'financial' | 'technology' | 'ecommerce' | 'social' | 'communication' | 'general'
  /** Primary canonical domain */
  primaryDomain: string
  /** Complete list of verified official domains, including regional ccTLDs */
  officialDomains: string[]
  /** Core brand tokens used for impersonation matching (lowercase) */
  brandTokens: string[]
  /** Legitimate subdomains or service domains */
  aliases?: string[]
}

export interface ConfusableAnalysis {
  hasNonAscii: boolean
  isPunycode: boolean
  scripts: string[]
  isMixedScript: boolean
  containsConfusables: boolean
  skeleton: string
  confusableReplacements: Array<{
    original: string
    replacement: string
    charIndex: number
    unicodeHex: string
    script: string
  }>
}

export interface SimilarityMatch {
  brand: OfficialBrand
  matchedTargetDomain: string
  technique:
    | 'homoglyph_skeleton'
    | 'transposition'
    | 'insertion'
    | 'deletion'
    | 'substitution'
    | 'repeated_char'
    | 'hyphen_insertion'
    | 'subdomain_brand_spoof'
    | 'embedded_brand_token'
  distance: number
  matchedToken: string
  similarityScore: number // 0 to 1
  explanation: string
}

export interface DetectionResult {
  /** Parsed hostname representation */
  parsed: ParsedHostname
  /** Final calculated risk verdict */
  verdict: Verdict
  /** Explainable risk score (0 = no threat indicators, 100 = critical threat) */
  riskScore: number
  /** Confidence in verdict (0 = uncertainty, 1 = high confidence) */
  confidence: number
  /** Concise summary of findings */
  summary: string
  /** Identified official brand target if impersonation is detected */
  impersonatedBrand?: OfficialBrand
  /** Safe destination URL if verified official domain mapping exists */
  recommendedOfficialUrl: string | null
  /** Recommended action for user */
  recommendedAction: 'PROCEED' | 'WARN_USER' | 'BLOCK_IMMEDIATELY' | 'NO_ACTION'
  /** All structured technical findings */
  findings: Finding[]
  /** Unicode and confusable analysis */
  confusableAnalysis?: ConfusableAnalysis
  /** Similarity matches if any brand impersonation was detected */
  similarityMatches: SimilarityMatch[]
  /** Metadata on whether threat intel was queried */
  threatIntelStatus: 'OFFLINE_ONLY' | 'QUERIED' | 'UNAVAILABLE' | 'CACHED'
  /** Evaluated at ISO timestamp */
  analyzedAt: string
}
