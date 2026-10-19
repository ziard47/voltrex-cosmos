import { describe, it, expect } from 'vitest'
import { defaultDomainEngine } from '@/engine'
import type { Verdict } from '@/engine/types'

interface CorpusTestCase {
  domain: string
  category:
    | 'legitimate_popular'
    | 'regional_official'
    | 'unicode_lookalike'
    | 'punycode_homoglyph'
    | 'typosquat'
    | 'deceptive_subdomain'
    | 'unrelated_brand_overlap'
    | 'legitimate_multilingual'
    | 'unknown_domain'
    | 'invalid_url'
  expectedVerdict: Verdict | 'NOT_MALICIOUS' | 'MALICIOUS_OR_SUSPICIOUS'
  notes?: string
}

const REGRESSION_CORPUS: CorpusTestCase[] = [
  // 1. Legitimate popular domains (Must NOT be flagged as malicious or suspicious)
  {
    domain: 'https://en.wikipedia.org',
    category: 'legitimate_popular',
    expectedVerdict: 'UNKNOWN',
  },
  {
    domain: 'https://github.com',
    category: 'legitimate_popular',
    expectedVerdict: 'LOW_RISK',
  },
  {
    domain: 'https://stackoverflow.com',
    category: 'legitimate_popular',
    expectedVerdict: 'UNKNOWN',
  },
  {
    domain: 'https://nytimes.com',
    category: 'legitimate_popular',
    expectedVerdict: 'UNKNOWN',
  },
  {
    domain: 'https://mozilla.org',
    category: 'legitimate_popular',
    expectedVerdict: 'UNKNOWN',
  },

  // 2. Regional official domains (Must match verified official catalog -> LOW_RISK)
  {
    domain: 'https://amazon.co.uk',
    category: 'regional_official',
    expectedVerdict: 'LOW_RISK',
  },
  {
    domain: 'https://amazon.co.jp',
    category: 'regional_official',
    expectedVerdict: 'LOW_RISK',
  },
  {
    domain: 'https://google.de',
    category: 'regional_official',
    expectedVerdict: 'LOW_RISK',
  },
  {
    domain: 'https://google.co.uk',
    category: 'regional_official',
    expectedVerdict: 'LOW_RISK',
  },
  {
    domain: 'https://paypal.ca',
    category: 'regional_official',
    expectedVerdict: 'LOW_RISK',
  },

  // 3. Unicode Lookalikes (Cyrillic, Greek, Mixed scripts -> MALICIOUS)
  {
    domain: 'https://pаypal.com', // Cyrillic \u0430
    category: 'unicode_lookalike',
    expectedVerdict: 'MALICIOUS',
    notes: 'Cyrillic "а" homoglyph spoofing PayPal',
  },
  {
    domain: 'https://gооgle.com', // Cyrillic \u043E\u043E
    category: 'unicode_lookalike',
    expectedVerdict: 'MALICIOUS',
    notes: 'Cyrillic "о" homoglyphs spoofing Google',
  },
  {
    domain: 'https://аррle.com', // Cyrillic \u0430, \u0440, \u0440
    category: 'unicode_lookalike',
    expectedVerdict: 'MALICIOUS',
    notes: 'Cyrillic homoglyphs spoofing Apple',
  },

  // 4. Punycode domains (IDN representation)
  {
    domain: 'https://xn--pypal-4ve.com', // pаypal.com in punycode
    category: 'punycode_homoglyph',
    expectedVerdict: 'MALICIOUS',
    notes: 'Wire punycode format for homoglyph',
  },

  // 5. Typosquatting examples
  {
    domain: 'https://paypa1.com', // Digit substitution 1 for l
    category: 'typosquat',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Digit 1 substitution for letter l',
  },
  {
    domain: 'https://paypaal.com', // Character insertion
    category: 'typosquat',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Repeated vowel insertion',
  },
  {
    domain: 'https://pyapal.com', // Adjacent transposition
    category: 'typosquat',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Adjacent transposition of letters a and y',
  },
  {
    domain: 'https://g00gle.com', // Digit 0 substitutions
    category: 'typosquat',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Digit 0 for letter o',
  },
  {
    domain: 'https://faceb00k.com', // Digit 0 substitutions
    category: 'typosquat',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Digit 0 for letter o',
  },

  // 6. Deceptive subdomains on unrelated registrable domains
  {
    domain: 'https://paypal.com.account-verify-login.net',
    category: 'deceptive_subdomain',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Brand in subdomain on attacker registrable domain',
  },
  {
    domain: 'https://google.com.security-check-portal.com',
    category: 'deceptive_subdomain',
    expectedVerdict: 'MALICIOUS_OR_SUSPICIOUS',
    notes: 'Brand in subdomain on attacker registrable domain',
  },

  // 7. Brand names in unrelated hostnames / legitimate lexical words (False Positive Check)
  {
    domain: 'https://amazonas-travel.org',
    category: 'unrelated_brand_overlap',
    expectedVerdict: 'NOT_MALICIOUS',
    notes: 'Legitimate geographical word "amazonas"',
  },
  {
    domain: 'https://striped-shirts.com',
    category: 'unrelated_brand_overlap',
    expectedVerdict: 'NOT_MALICIOUS',
    notes: 'Legitimate adjective "striped"',
  },
  {
    domain: 'https://appletree-orchard.com',
    category: 'unrelated_brand_overlap',
    expectedVerdict: 'NOT_MALICIOUS',
    notes: 'Compound word "appletree"',
  },

  // 8. Legitimate multilingual websites (False Positive Check)
  {
    domain: 'https://münchen.de',
    category: 'legitimate_multilingual',
    expectedVerdict: 'NOT_MALICIOUS',
    notes: 'German city municipal domain with umlaut',
  },
  {
    domain: 'https://tokyo.jp',
    category: 'legitimate_multilingual',
    expectedVerdict: 'NOT_MALICIOUS',
    notes: 'Regional Japanese domain',
  },

  // 9. Unknown domains (Must remain UNKNOWN, preserving honest uncertainty)
  {
    domain: 'https://random-developer-blog-2026.io',
    category: 'unknown_domain',
    expectedVerdict: 'UNKNOWN',
    notes: 'Unfamiliar domain with no suspicious indicators',
  },
  {
    domain: 'https://my-personal-design-portfolio.dev',
    category: 'unknown_domain',
    expectedVerdict: 'UNKNOWN',
    notes: 'Unfamiliar domain with no suspicious indicators',
  },

  // 10. Malformed or invalid URLs
  {
    domain: 'javascript:alert(1)',
    category: 'invalid_url',
    expectedVerdict: 'UNKNOWN',
    notes: 'Dangerous pseudo-scheme rejected safely',
  },
  {
    domain: 'data:text/html,<h1>test</h1>',
    category: 'invalid_url',
    expectedVerdict: 'UNKNOWN',
    notes: 'Data URL rejected safely',
  },
  {
    domain: '',
    category: 'invalid_url',
    expectedVerdict: 'UNKNOWN',
    notes: 'Empty string',
  },
]

describe('Phase 4: False-Positive and False-Negative Regression Corpus', () => {
  let falsePositives = 0
  let falseNegatives = 0

  it('evaluates entire regression corpus with zero unexpected false positives or false negatives', async () => {
    for (const testCase of REGRESSION_CORPUS) {
      const result = await defaultDomainEngine.analyze(testCase.domain)

      if (testCase.expectedVerdict === 'NOT_MALICIOUS') {
        const isFp = result.verdict === 'MALICIOUS'
        if (isFp) falsePositives++
        expect(
          result.verdict,
          `False Positive on ${testCase.domain} (${testCase.notes || ''})`
        ).not.toBe('MALICIOUS')
      } else if (testCase.expectedVerdict === 'MALICIOUS_OR_SUSPICIOUS') {
        const isFn = result.verdict !== 'MALICIOUS' && result.verdict !== 'SUSPICIOUS'
        if (isFn) falseNegatives++
        expect(
          ['MALICIOUS', 'SUSPICIOUS'],
          `False Negative on ${testCase.domain} (${testCase.notes || ''})`
        ).toContain(result.verdict)
      } else {
        expect(
          result.verdict,
          `Verdict mismatch for ${testCase.domain} (${testCase.notes || ''})`
        ).toBe(testCase.expectedVerdict)
      }
    }

    expect(falsePositives).toBe(0)
    expect(falseNegatives).toBe(0)
  })

  it('measures corpus detection metrics', async () => {
    let testedCount = 0
    let detectedLookalikes = 0

    for (const testCase of REGRESSION_CORPUS) {
      if (
        testCase.category === 'unicode_lookalike' ||
        testCase.category === 'punycode_homoglyph' ||
        testCase.category === 'typosquat' ||
        testCase.category === 'deceptive_subdomain'
      ) {
        testedCount++
        const result = await defaultDomainEngine.analyze(testCase.domain)
        if (result.verdict === 'MALICIOUS' || result.verdict === 'SUSPICIOUS') {
          detectedLookalikes++
        }
      }
    }

    const detectionRate = (detectedLookalikes / testedCount) * 100
    expect(detectionRate).toBe(100)
  })
})
