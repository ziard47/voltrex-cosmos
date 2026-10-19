import { describe, it, expect } from 'vitest'
import { damerauLevenshteinDistance } from './damerauLevenshtein'
import { detectTyposquattingAndImpersonation } from './typosquattingDetector'
import { parseHostname } from '../parser/hostnameParser'
import { analyzeConfusables } from '../confusables/unicodeConfusables'

describe('damerauLevenshteinDistance', () => {
  it('correctly handles adjacent character transpositions with distance 1', () => {
    // "payapl" transposed from "paypal"
    expect(damerauLevenshteinDistance('payapl', 'paypal')).toBe(1)
    // "googel" transposed from "google"
    expect(damerauLevenshteinDistance('googel', 'google')).toBe(1)
  })

  it('correctly calculates single deletions and insertions', () => {
    expect(damerauLevenshteinDistance('pypal', 'paypal')).toBe(1) // deletion
    expect(damerauLevenshteinDistance('paypaal', 'paypal')).toBe(1) // insertion
  })

  it('correctly calculates single substitutions', () => {
    expect(damerauLevenshteinDistance('paypel', 'paypal')).toBe(1)
  })
})

describe('detectTyposquattingAndImpersonation', () => {
  it('detects adjacent transposition typosquatting', () => {
    const parsed = parseHostname('https://payapl.com/signin')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('paypal')
    expect(matches[0]?.technique).toBe('transposition')
  })

  it('detects character omission/deletion typosquatting', () => {
    const parsed = parseHostname('https://pypal.com')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('paypal')
    expect(matches[0]?.technique).toBe('deletion')
  })

  it('detects digit substitution (g00gle.com)', () => {
    const parsed = parseHostname('http://g00gle.com')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('google')
  })

  it('detects repeated character stretches (gooogle.com)', () => {
    const parsed = parseHostname('https://gooogle.com')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('google')
    expect(matches[0]?.technique).toBe('repeated_char')
  })

  it('detects subdomain brand spoofing on unrelated domain', () => {
    // paypal.com used in subdomain of attacker.net
    const parsed = parseHostname('https://paypal.com.account-verify.attacker.net/login')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('paypal')
    expect(matches[0]?.technique).toBe('subdomain_brand_spoof')
  })

  it('detects brand name embedded with phishing keywords', () => {
    const parsed = parseHostname('https://chase-account-verify.net')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.brand.id).toBe('chase')
  })

  it('does NOT flag legitimate official brand domains as lookalikes', () => {
    const parsed = parseHostname('https://paypal.com/signin')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBe(0)
  })

  it('does not produce false positives on unrelated common short domains', () => {
    // "pay.com" is a legitimate domain, not a typosquat of "paypal"
    const parsed = parseHostname('https://pay.com')
    const confusables = analyzeConfusables(parsed.hostname)
    const matches = detectTyposquattingAndImpersonation(parsed, confusables)

    expect(matches.length).toBe(0)
  })
})
