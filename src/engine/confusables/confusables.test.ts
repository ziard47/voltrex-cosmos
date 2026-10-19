import { describe, it, expect } from 'vitest'
import { analyzeConfusables } from './unicodeConfusables'

describe('unicodeConfusables', () => {
  it('detects Cyrillic homoglyph in mixed-script domain', () => {
    // 'pаypal.com' with Cyrillic 'а' (\u0430)
    const result = analyzeConfusables('p\u0430ypal.com')
    expect(result.hasNonAscii).toBe(true)
    expect(result.isMixedScript).toBe(true)
    expect(result.containsConfusables).toBe(true)
    expect(result.scripts).toContain('Cyrillic')
    expect(result.scripts).toContain('Latin')
    expect(result.skeleton).toBe('paypal.com')

    const rep = result.confusableReplacements.find((r) => r.original === '\u0430')
    expect(rep).toBeDefined()
    expect(rep?.replacement).toBe('a')
    expect(rep?.script).toBe('Cyrillic')
  })

  it('detects Greek homoglyph substitutions', () => {
    // 'αpple.com' with Greek alpha (\u03b1)
    const result = analyzeConfusables('\u03B1pple.com')
    expect(result.containsConfusables).toBe(true)
    expect(result.skeleton).toBe('apple.com')
    expect(result.scripts).toContain('Greek')
    expect(result.scripts).toContain('Latin')
    expect(result.isMixedScript).toBe(true)
  })

  it('detects digit homoglyphs in domain labels', () => {
    const result = analyzeConfusables('g00gle.com')
    expect(result.containsConfusables).toBe(true)
    expect(result.skeleton).toBe('google.com')
    expect(result.confusableReplacements.length).toBe(2)
  })

  it('recognizes pure ASCII Latin without reporting mixed scripts', () => {
    const result = analyzeConfusables('google.com')
    expect(result.hasNonAscii).toBe(false)
    expect(result.isPunycode).toBe(false)
    expect(result.isMixedScript).toBe(false)
    expect(result.containsConfusables).toBe(false)
    expect(result.skeleton).toBe('google.com')
  })

  it('handles Punycode input transparently', () => {
    // xn--pypal-4ve.com decodes to pаypal.com
    const result = analyzeConfusables('xn--pypal-4ve.com')
    expect(result.isPunycode).toBe(true)
    expect(result.skeleton).toBe('paypal.com')
    expect(result.containsConfusables).toBe(true)
  })
})
