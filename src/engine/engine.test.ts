import { describe, it, expect } from 'vitest'
import { DomainIntelligenceEngine, defaultDomainEngine } from './engine'
import type { ThreatIntelProvider, ThreatIntelResult } from './reputation/types'

describe('DomainIntelligenceEngine (End-to-End)', () => {
  it('flags Cyrillic homoglyph lookalike as MALICIOUS and suggests official PayPal URL', async () => {
    // pаypal.com with Cyrillic 'а' (\u0430)
    const result = await defaultDomainEngine.analyze('https://p\u0430ypal.com/signin')

    expect(result.verdict).toBe('MALICIOUS')
    expect(result.riskScore).toBeGreaterThanOrEqual(75)
    expect(result.impersonatedBrand?.id).toBe('paypal')
    expect(result.recommendedOfficialUrl).toBe('https://paypal.com')
    expect(result.recommendedAction).toBe('WARN_USER')
    expect(result.findings.some((f) => f.category === 'homoglyph')).toBe(true)
  })

  it('flags Raw Punycode representation of homoglyph domain', async () => {
    const result = await defaultDomainEngine.analyze('http://xn--pypal-4ve.com')

    expect(result.verdict).toBe('MALICIOUS')
    expect(result.parsed.isIdn).toBe(true)
    expect(result.impersonatedBrand?.id).toBe('paypal')
  })

  it('flags transposition typosquatting as SUSPICIOUS', async () => {
    const result = await defaultDomainEngine.analyze('https://payapl.com')

    expect(result.verdict).toBe('SUSPICIOUS')
    expect(result.riskScore).toBeGreaterThanOrEqual(45)
    expect(result.impersonatedBrand?.id).toBe('paypal')
    expect(result.recommendedOfficialUrl).toBe('https://paypal.com')
  })

  it('flags subdomain brand impersonation as MALICIOUS', async () => {
    const result = await defaultDomainEngine.analyze(
      'https://paypal.com.verify-billing.attacker.xyz/login'
    )

    expect(result.verdict).toBe('MALICIOUS')
    expect(result.impersonatedBrand?.id).toBe('paypal')
    expect(result.findings.some((f) => f.category === 'subdomain_spoof')).toBe(true)
  })

  it('classifies legitimate verified official domains and regional ccTLDs as LOW_RISK', async () => {
    const googleUk = await defaultDomainEngine.analyze(
      'https://www.google.co.uk/search?q=cybersecurity'
    )
    expect(googleUk.verdict).toBe('LOW_RISK')
    expect(googleUk.impersonatedBrand?.id).toBe('google')
    expect(googleUk.recommendedAction).toBe('PROCEED')

    const paypal = await defaultDomainEngine.analyze('https://paypal.com')
    expect(paypal.verdict).toBe('LOW_RISK')

    const amazonJp = await defaultDomainEngine.analyze('https://amazon.co.jp')
    expect(amazonJp.verdict).toBe('LOW_RISK')
  })

  it('leaves unfamiliar domains as UNKNOWN when no suspicious indicators exist', async () => {
    // An unfamiliar personal blog or internal project domain
    const result = await defaultDomainEngine.analyze(
      'https://alex-personal-portfolio.dev'
    )

    expect(result.verdict).toBe('UNKNOWN')
    expect(result.riskScore).toBeLessThan(45)
    expect(result.impersonatedBrand).toBeUndefined()
    expect(result.recommendedOfficialUrl).toBeNull()
    expect(result.summary).toContain('Unfamiliar domain')
  })

  it('flags public IP navigation as SUSPICIOUS', async () => {
    const result = await defaultDomainEngine.analyze('http://93.184.216.34/index.html')

    expect(result.parsed.isIp).toBe(true)
    expect(result.verdict).toBe('SUSPICIOUS')
    expect(result.findings.some((f) => f.category === 'ip_direct')).toBe(true)
  })

  it('honors user allowlist override as LOW_RISK', async () => {
    // An arbitrary domain that is allowlisted
    const result = await defaultDomainEngine.analyze('https://untrusted-lookalike.xyz', {
      isAllowlisted: true,
    })

    expect(result.verdict).toBe('LOW_RISK')
    expect(result.riskScore).toBe(5)
    expect(result.findings.some((f) => f.category === 'allowlist')).toBe(true)
  })

  it('integrates with external threat intel provider when configured and enabled', async () => {
    const mockProvider: ThreatIntelProvider = {
      name: 'MockExternalIntel',
      getStatus: async () => ({
        providerName: 'MockExternalIntel',
        isConfigured: true,
        isOnline: true,
        statusMessage: 'Ready',
        supportedFeatures: ['live_reputation'],
      }),
      lookupDomain: async (domain: string): Promise<ThreatIntelResult> => ({
        source: 'MockExternalIntel',
        isAvailable: true,
        reputationVerdict: domain === 'flagged-by-feed.org' ? 'malicious' : 'benign',
        confidence: 0.95,
        queriedAt: new Date().toISOString(),
      }),
    }

    const engineWithIntel = new DomainIntelligenceEngine({
      threatIntelProvider: mockProvider,
      enableExternalLookups: true,
    })

    const result = await engineWithIntel.analyze('https://flagged-by-feed.org', {
      checkThreatIntel: true,
    })

    expect(result.threatIntelStatus).toBe('QUERIED')
    expect(result.verdict).toBe('MALICIOUS')
    expect(
      result.findings.some((f) => f.title.includes('External Intelligence Match'))
    ).toBe(true)
  })
})
