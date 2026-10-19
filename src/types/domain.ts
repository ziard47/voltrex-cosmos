export type RiskLevel = 'unknown' | 'checking' | 'low_risk' | 'suspicious' | 'malicious'

export type IndicatorCategory =
  | 'punycode'
  | 'typosquat'
  | 'homoglyph'
  | 'subdomain_spoof'
  | 'embedded_brand'
  | 'tld'
  | 'reputation'
  | 'entropy'
  | 'impersonation'
  | 'official_domain'

export type IndicatorSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export interface SecurityIndicator {
  id: string
  category: IndicatorCategory
  severity: IndicatorSeverity
  title: string
  description: string
  detectedValue?: string
}

export interface DomainAnalysis {
  url: string
  hostname: string
  normalizedHostname: string
  isPunycode: boolean
  punycodeDecoded?: string
  riskLevel: RiskLevel
  riskScore: number // 0 to 100
  statusExplanation: string
  targetBrand?: string
  indicators: SecurityIndicator[]
  verifiedOfficialUrl?: string | null
  analyzedAt: string
  analysisSource?: 'local_heuristics' | 'threat_intelligence' | 'hybrid'
  isMockVerdict?: boolean
}

export interface RecentDetection {
  id: string
  hostname: string
  riskLevel: RiskLevel
  detectedAt: string
  matchedTarget?: string
  indicatorCount: number
}
