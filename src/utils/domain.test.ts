import { describe, it, expect } from 'vitest'
import {
  normalizeHostname,
  isValidDomain,
  isPunycode,
  hasMixedScripts,
  calculateEntropy,
  getRiskLabel,
  getRiskColorTokens,
  formatRelativeTime,
} from './domain'

describe('normalizeHostname', () => {
  it('strips https protocol, path, and port', () => {
    expect(normalizeHostname('https://Example.COM:8080/path/to/page?query=1#hash')).toBe(
      'example.com'
    )
  })

  it('handles user authentication in URL', () => {
    expect(normalizeHostname('https://user:password@malicious.site.xyz/login')).toBe(
      'malicious.site.xyz'
    )
  })

  it('handles raw domains and trailing dots', () => {
    expect(normalizeHostname('   google.com.   ')).toBe('google.com')
  })

  it('returns empty string for invalid or empty input', () => {
    expect(normalizeHostname('')).toBe('')
    // @ts-expect-error testing null input
    expect(normalizeHostname(null)).toBe('')
  })
})

describe('isValidDomain', () => {
  it('validates legitimate domains', () => {
    expect(isValidDomain('example.com')).toBe(true)
    expect(isValidDomain('sub.domain.co.uk')).toBe(true)
    expect(isValidDomain('localhost')).toBe(true)
  })

  it('rejects invalid domain strings', () => {
    expect(isValidDomain('invalid_domain')).toBe(false)
    expect(isValidDomain('')).toBe(false)
    expect(isValidDomain('http://hasprotocol.com')).toBe(false)
  })
})

describe('isPunycode', () => {
  it('detects punycode encoded domains', () => {
    expect(isPunycode('xn--pypal-4ve.com')).toBe(true)
    expect(isPunycode('sub.xn--apple-q9a.org')).toBe(true)
  })

  it('returns false for standard ascii domains', () => {
    expect(isPunycode('paypal.com')).toBe(false)
    expect(isPunycode('google.com')).toBe(false)
  })
})

describe('hasMixedScripts', () => {
  it('detects Cyrillic homoglyphs embedded in Latin text', () => {
    // 'pаypal.com' with Cyrillic 'а' (\u0430)
    expect(hasMixedScripts('p\u0430ypal.com')).toBe(true)
  })

  it('returns false for pure Latin text', () => {
    expect(hasMixedScripts('paypal.com')).toBe(false)
  })
})

describe('calculateEntropy', () => {
  it('computes higher entropy for random character sets', () => {
    const low = calculateEntropy('aaaaa')
    const high = calculateEntropy('x8f9q2m1z')
    expect(low).toBe(0)
    expect(high).toBeGreaterThan(2.5)
  })
})

describe('getRiskLabel & getRiskColorTokens', () => {
  it('covers all five required security risk states', () => {
    const states = ['unknown', 'checking', 'low_risk', 'suspicious', 'malicious'] as const
    for (const state of states) {
      const label = getRiskLabel(state)
      const tokens = getRiskColorTokens(state)
      expect(label).toBeTruthy()
      expect(tokens.textColor).toBeTruthy()
      expect(tokens.badgeBg).toBeTruthy()
    }
  })
})

describe('formatRelativeTime', () => {
  it('formats recent timestamps gracefully', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('Just now')

    const tenMinAgo = new Date(Date.now() - 1000 * 60 * 10).toISOString()
    expect(formatRelativeTime(tenMinAgo)).toBe('10m ago')
  })
})
