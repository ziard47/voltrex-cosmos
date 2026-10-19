import type { ThreatIntelCache, ThreatIntelResult } from './types'

interface CacheEntry {
  result: ThreatIntelResult
  expiresAt: number
}

export class MemoryThreatIntelCache implements ThreatIntelCache {
  private cache = new Map<string, CacheEntry>()
  private defaultTtlMs: number

  constructor(defaultTtlMs: number = 1000 * 60 * 30) {
    // 30 minutes default TTL
    this.defaultTtlMs = defaultTtlMs
  }

  async get(domain: string): Promise<ThreatIntelResult | null> {
    const key = domain.toLowerCase().trim()
    const entry = this.cache.get(key)

    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return { ...entry.result, cached: true }
  }

  async set(domain: string, result: ThreatIntelResult, ttlMs?: number): Promise<void> {
    const key = domain.toLowerCase().trim()
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + ttl,
    })
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}
