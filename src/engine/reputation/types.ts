/**
 * Voltrex Cosmos — Threat Intelligence Interface Types
 */

export interface ProviderStatus {
  providerName: string
  isConfigured: boolean
  isOnline: boolean
  statusMessage: string
  supportedFeatures: string[]
  lastCheck?: string
}

export interface ThreatIntelResult {
  source: string
  isAvailable: boolean
  reputationVerdict?: 'benign' | 'suspicious' | 'malicious' | 'unknown'
  confidence?: number // 0 to 1
  threatCategories?: string[]
  cached?: boolean
  error?: string
  queriedAt: string
}

export interface ThreatIntelCache {
  get(domain: string): Promise<ThreatIntelResult | null>
  set(domain: string, result: ThreatIntelResult, ttlMs?: number): Promise<void>
  clear(): Promise<void>
}

export interface ThreatIntelProvider {
  readonly name: string
  getStatus(): Promise<ProviderStatus>
  lookupDomain(
    domain: string,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<ThreatIntelResult>
}
