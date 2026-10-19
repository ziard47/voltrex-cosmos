import { describe, it, expect } from 'vitest'
import { NullThreatIntelProvider } from './nullProvider'
import { MemoryThreatIntelCache } from './memoryCache'
import type { ThreatIntelResult } from './types'

describe('NullThreatIntelProvider', () => {
  it('reports honest offline status without claiming active intelligence', async () => {
    const provider = new NullThreatIntelProvider()
    const status = await provider.getStatus()

    expect(status.isConfigured).toBe(false)
    expect(status.isOnline).toBe(false)
    expect(status.statusMessage).toContain('not configured')
  })

  it('does not invent fake reputation results', async () => {
    const provider = new NullThreatIntelProvider()
    const result = await provider.lookupDomain('example.com')

    expect(result.isAvailable).toBe(false)
    expect(result.reputationVerdict).toBe('unknown')
    expect(result.confidence).toBe(0)
    expect(result.error).toContain('not configured')
  })

  it('honors abort signal when aborted', async () => {
    const provider = new NullThreatIntelProvider()
    const controller = new AbortController()
    controller.abort()

    await expect(
      provider.lookupDomain('example.com', { signal: controller.signal })
    ).rejects.toThrow('aborted')
  })
})

describe('MemoryThreatIntelCache', () => {
  it('stores and retrieves cached items', async () => {
    const cache = new MemoryThreatIntelCache(5000)
    const mockResult: ThreatIntelResult = {
      source: 'MockTest',
      isAvailable: true,
      reputationVerdict: 'malicious',
      confidence: 0.9,
      queriedAt: new Date().toISOString(),
    }

    await cache.set('bad-domain.xyz', mockResult)
    const retrieved = await cache.get('bad-domain.xyz')

    expect(retrieved).not.toBeNull()
    expect(retrieved?.cached).toBe(true)
    expect(retrieved?.reputationVerdict).toBe('malicious')
  })

  it('expires stale entries after TTL', async () => {
    // 50ms TTL
    const cache = new MemoryThreatIntelCache(50)
    const mockResult: ThreatIntelResult = {
      source: 'MockTest',
      isAvailable: true,
      queriedAt: new Date().toISOString(),
    }

    await cache.set('fast-expire.com', mockResult)
    expect(await cache.get('fast-expire.com')).not.toBeNull()

    // Wait 60ms
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(await cache.get('fast-expire.com')).toBeNull()
  })

  it('clears all cached entries on request', async () => {
    const cache = new MemoryThreatIntelCache()
    await cache.set('d1.com', {
      source: 'Test',
      isAvailable: true,
      queriedAt: new Date().toISOString(),
    })
    await cache.set('d2.com', {
      source: 'Test',
      isAvailable: true,
      queriedAt: new Date().toISOString(),
    })

    expect(cache.size()).toBe(2)
    await cache.clear()
    expect(cache.size()).toBe(0)
  })
})
