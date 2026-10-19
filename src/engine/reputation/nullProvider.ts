import type { ProviderStatus, ThreatIntelProvider, ThreatIntelResult } from './types'

/**
 * Default offline provider that honestly reports no external provider is configured.
 * Does not invent fake reputation scores or fabricate threat intelligence.
 */
export class NullThreatIntelProvider implements ThreatIntelProvider {
  readonly name = 'LocalOfflineProvider'

  async getStatus(): Promise<ProviderStatus> {
    return {
      providerName: this.name,
      isConfigured: false,
      isOnline: false,
      statusMessage:
        'External threat intelligence provider is not configured. Operating in local-only deterministic heuristic mode.',
      supportedFeatures: ['offline_heuristic_evaluation'],
      lastCheck: new Date().toISOString(),
    }
  }

  async lookupDomain(
    _domain: string,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<ThreatIntelResult> {
    // Respect caller-provided abort signal if already aborted
    if (options?.signal?.aborted) {
      throw new Error('Threat intelligence request aborted')
    }

    // Default provider honestly returns unconfigured status without making network calls
    return {
      source: this.name,
      isAvailable: false,
      reputationVerdict: 'unknown',
      confidence: 0,
      threatCategories: [],
      error: 'External reputation feeds not configured in local environment',
      queriedAt: new Date().toISOString(),
    }
  }
}
