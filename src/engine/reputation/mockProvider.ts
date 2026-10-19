import type { ProviderStatus, ThreatIntelProvider, ThreatIntelResult } from './types'

export interface MockProviderConfig {
  name?: string
  isConfigured?: boolean
  isOnline?: boolean
  simulateDelayMs?: number
  simulateError?: string
  maliciousDomains?: string[]
  benignDomains?: string[]
}

/**
 * Mock Threat Intelligence Provider for deterministic integration testing and demonstration.
 * Never performs external network requests.
 * Explicitly distinguishes configured/online status from simulated failures.
 */
export class MockThreatIntelProvider implements ThreatIntelProvider {
  readonly name: string
  private config: MockProviderConfig

  constructor(config: MockProviderConfig = {}) {
    this.name = config.name || 'MockThreatIntelProvider'
    this.config = {
      isConfigured: true,
      isOnline: true,
      simulateDelayMs: 0,
      maliciousDomains: ['confirmed-malicious.com', 'phish-threat.net'],
      benignDomains: ['known-safe-partner.org'],
      ...config,
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    return {
      providerName: this.name,
      isConfigured: this.config.isConfigured ?? true,
      isOnline: this.config.isOnline ?? true,
      statusMessage: this.config.isOnline
        ? 'Mock threat intelligence provider operational for testing.'
        : 'Mock threat intelligence provider is offline or unreachable.',
      supportedFeatures: ['mock_reputation_lookup', 'test_timeout_simulation'],
      lastCheck: new Date().toISOString(),
    }
  }

  async lookupDomain(
    domain: string,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<ThreatIntelResult> {
    if (options?.signal?.aborted) {
      throw new Error('Threat intelligence lookup was aborted by caller.')
    }

    if (!this.config.isConfigured) {
      return {
        source: this.name,
        isAvailable: false,
        reputationVerdict: 'unknown',
        confidence: 0,
        error: 'Provider is not configured.',
        queriedAt: new Date().toISOString(),
      }
    }

    if (!this.config.isOnline) {
      return {
        source: this.name,
        isAvailable: false,
        reputationVerdict: 'unknown',
        confidence: 0,
        error: 'Threat intelligence service is currently offline.',
        queriedAt: new Date().toISOString(),
      }
    }

    if (this.config.simulateError) {
      throw new Error(this.config.simulateError)
    }

    // Simulate delay if configured, respecting abort signal
    if (this.config.simulateDelayMs && this.config.simulateDelayMs > 0) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, this.config.simulateDelayMs)
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('Request timed out or aborted'))
          })
        }
      })
    }

    const lower = domain.toLowerCase()
    if (this.config.maliciousDomains?.includes(lower)) {
      return {
        source: this.name,
        isAvailable: true,
        reputationVerdict: 'malicious',
        confidence: 0.95,
        threatCategories: ['credential_phishing', 'active_campaign'],
        queriedAt: new Date().toISOString(),
      }
    }

    if (this.config.benignDomains?.includes(lower)) {
      return {
        source: this.name,
        isAvailable: true,
        reputationVerdict: 'benign',
        confidence: 0.9,
        threatCategories: [],
        queriedAt: new Date().toISOString(),
      }
    }

    return {
      source: this.name,
      isAvailable: true,
      reputationVerdict: 'unknown',
      confidence: 0.5,
      threatCategories: [],
      queriedAt: new Date().toISOString(),
    }
  }
}
