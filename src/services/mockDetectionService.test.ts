import { describe, it, expect } from 'vitest'
import { mockDetectionService } from './mockDetectionService'

describe('mockDetectionService', () => {
  it('identifies known Cyrillic homoglyph lookalike (pаypal.com)', async () => {
    // pаypal.com with cyrillic 'а'
    const result = await mockDetectionService.analyzeDomain(
      'https://p\u0430ypal.com/signin'
    )
    expect(result.riskLevel).toBe('malicious')
    expect(result.targetBrand).toBe('PayPal')
    expect(result.indicators.length).toBeGreaterThan(0)
    expect(result.isMockVerdict).toBe(true)
  })

  it('identifies brand typosquatting (g00gle-security-login.xyz)', async () => {
    const result = await mockDetectionService.analyzeDomain(
      'http://g00gle-security-login.xyz'
    )
    expect(result.riskLevel).toBe('malicious')
    expect(result.targetBrand).toBe('Google')
    expect(result.indicators.some((i) => i.category === 'typosquat')).toBe(true)
    expect(result.isMockVerdict).toBe(true)
  })

  it('never certifies unindexed domains as verified safe', async () => {
    const result = await mockDetectionService.analyzeDomain('https://example.com')
    expect(result.riskLevel).not.toBe('malicious')
    // Must contain caution note and never claim safety guarantee
    expect(result.statusExplanation).toContain('Not an official safety guarantee')
    expect(result.isMockVerdict).toBe(true)
  })

  it('handles browser internal URLs gracefully', async () => {
    const result = await mockDetectionService.analyzeDomain('chrome://settings')
    expect(result.riskLevel).toBe('unknown')
    expect(result.statusExplanation).toContain('Browser internal')
  })
})
