import type { DomainAnalysis, RiskLevel, SecurityIndicator } from '@/types/domain'
import {
  normalizeHostname,
  isPunycode,
  decodePunycode,
  hasMixedScripts,
  calculateEntropy,
} from '@/utils/domain'
import { storageService } from './storageService'

/**
 * PHASE 1 MOCK DETECTION SERVICE
 *
 * NOTE: This service supplies deterministic mock scenarios to validate the UI,
 * warning pages, and settings without claiming to be an operational threat engine.
 * Full heuristic and ML-based detection will be introduced in Phase 2.
 */

interface MockProfile {
  targetBrand?: string
  riskLevel: RiskLevel
  riskScore: number
  statusExplanation: string
  indicators: SecurityIndicator[]
  suggestedOfficialDomain?: string
}

const KNOWN_MOCK_PROFILES: Record<string, MockProfile> = {
  // Homoglyph attack: Cyrillic 'а' (\u0430) instead of Latin 'a'
  'pаypal.com': {
    targetBrand: 'PayPal',
    riskLevel: 'malicious',
    riskScore: 96,
    statusExplanation:
      'Impersonation alert: Domain utilizes Cyrillic homoglyphs to visually spoof "paypal.com".',
    suggestedOfficialDomain: 'paypal.com',
    indicators: [
      {
        id: 'ind-homoglyph-1',
        category: 'punycode',
        severity: 'critical',
        title: 'Homoglyph Character Spoofing',
        description:
          'Contains Cyrillic small letter "а" (U+0430) disguised as Latin "a".',
        detectedValue: 'xn--pypal-4ve.com',
      },
      {
        id: 'ind-impersonate-1',
        category: 'impersonation',
        severity: 'critical',
        title: 'Brand Impersonation Target',
        description:
          'Visual identity and domain structure matches targeted brand: PayPal, Inc.',
        detectedValue: 'Target: paypal.com',
      },
      {
        id: 'ind-reputation-1',
        category: 'reputation',
        severity: 'high',
        title: 'Zero Domain Age / Untrusted Registrar',
        description:
          'Domain registered under privacy shield with no legitimate historical traffic.',
      },
    ],
  },

  'xn--pypal-4ve.com': {
    targetBrand: 'PayPal',
    riskLevel: 'malicious',
    riskScore: 96,
    statusExplanation:
      'Punycode lookalike: Raw punycode representation of homoglyphic domain spoofing PayPal.',
    suggestedOfficialDomain: 'paypal.com',
    indicators: [
      {
        id: 'ind-puny-raw',
        category: 'punycode',
        severity: 'critical',
        title: 'Internationalized Domain Name (IDN) Spoof',
        description:
          'Punycode encoding decodes into non-Latin characters masquerading as paypal.com.',
        detectedValue: 'Decodes to: pаypal.com',
      },
    ],
  },

  'g00gle-security-login.xyz': {
    targetBrand: 'Google',
    riskLevel: 'malicious',
    riskScore: 92,
    statusExplanation:
      'Deceptive login portal: Combines brand typosquatting ("g00gle") with high-risk TLD (.xyz).',
    suggestedOfficialDomain: 'google.com',
    indicators: [
      {
        id: 'ind-typo-1',
        category: 'typosquat',
        severity: 'critical',
        title: 'Character Substitution Typosquat',
        description:
          'Replaces double "o" with zeros ("00") to mimic brand name "google".',
        detectedValue: 'g00gle -> google',
      },
      {
        id: 'ind-tld-1',
        category: 'tld',
        severity: 'high',
        title: 'High-Abuse Top-Level Domain',
        description:
          'The .xyz TLD exhibits elevated rates of credential harvesting attacks.',
        detectedValue: '.xyz',
      },
      {
        id: 'ind-impersonate-2',
        category: 'impersonation',
        severity: 'high',
        title: 'Phishing Keyword Stacking',
        description: 'Contains sensitive authentication keywords: "security-login".',
      },
    ],
  },

  'chase-account-verify.net': {
    targetBrand: 'Chase Bank',
    riskLevel: 'suspicious',
    riskScore: 78,
    statusExplanation:
      'High-suspicion financial lure: Unofficial host stacking banking brand and verification keywords.',
    suggestedOfficialDomain: 'chase.com',
    indicators: [
      {
        id: 'ind-lure-1',
        category: 'impersonation',
        severity: 'high',
        title: 'Financial Institution Keyword Lure',
        description:
          'Combines banking brand "chase" with urgency keyword "account-verify".',
        detectedValue: 'chase-account-verify',
      },
      {
        id: 'ind-entropy-1',
        category: 'entropy',
        severity: 'medium',
        title: 'Elevated Hostname Entropy',
        description:
          'Multi-part hyphenated structure characteristic of phishing campaign domains.',
      },
    ],
  },

  'microsoft365-admin-portal.tk': {
    targetBrand: 'Microsoft',
    riskLevel: 'malicious',
    riskScore: 94,
    statusExplanation:
      'Enterprise credential threat: Fake administrative portal on suspicious free TLD (.tk).',
    suggestedOfficialDomain: 'microsoft.com',
    indicators: [
      {
        id: 'ind-tld-free',
        category: 'tld',
        severity: 'critical',
        title: 'Abused Free TLD Registry',
        description:
          'Free registrar domains (.tk) are heavily abused for transient phishing campaigns.',
      },
      {
        id: 'ind-impersonate-ms',
        category: 'impersonation',
        severity: 'high',
        title: 'Enterprise Impersonation',
        description: 'Poses as official Microsoft 365 tenant administrative portal.',
      },
    ],
  },
}

export const mockDetectionService = {
  /**
   * Evaluates a domain with mock heuristics and catalog data.
   * Explicitly signals that Phase 1 does NOT certify absolute safety.
   */
  async analyzeDomain(rawInput: string): Promise<DomainAnalysis> {
    const hostname = normalizeHostname(rawInput)

    // Check if domain is in the user's trusted allowlist
    const isAllowlisted = await storageService.isAllowlisted(hostname)
    if (isAllowlisted) {
      return {
        url: rawInput,
        hostname,
        normalizedHostname: hostname,
        isPunycode: isPunycode(hostname),
        riskLevel: 'low_risk',
        riskScore: 5,
        statusExplanation:
          'Domain is on your personal trusted allowlist. Voltrex Cosmos has bypassed warnings.',
        indicators: [
          {
            id: 'ind-user-allowlist',
            category: 'reputation',
            severity: 'info',
            title: 'Trusted Allowlist Override',
            description: 'You manually added this domain to your trusted allowlist.',
          },
        ],
        analyzedAt: new Date().toISOString(),
        isMockVerdict: true,
      }
    }

    // Check known mock catalog entries
    const knownProfile = KNOWN_MOCK_PROFILES[hostname]
    if (knownProfile) {
      return {
        url: rawInput,
        hostname,
        normalizedHostname: hostname,
        isPunycode: isPunycode(hostname),
        punycodeDecoded: decodePunycode(hostname),
        riskLevel: knownProfile.riskLevel,
        riskScore: knownProfile.riskScore,
        statusExplanation: knownProfile.statusExplanation,
        targetBrand: knownProfile.targetBrand,
        indicators: knownProfile.indicators,
        verifiedOfficialUrl: knownProfile.suggestedOfficialDomain
          ? `https://${knownProfile.suggestedOfficialDomain}`
          : null,
        analyzedAt: new Date().toISOString(),
        isMockVerdict: true,
      }
    }

    // Dynamic mock heuristic check for unindexed domains
    const puny = isPunycode(hostname)
    const mixed = hasMixedScripts(hostname)
    const entropy = calculateEntropy(hostname)
    const dynamicIndicators: SecurityIndicator[] = []

    if (puny || mixed) {
      dynamicIndicators.push({
        id: 'ind-dyn-puny',
        category: 'punycode',
        severity: 'high',
        title: 'Non-Standard Script / Punycode Detected',
        description:
          'Domain uses internationalized character representation that may mimic Latin letters.',
      })
    }

    if (entropy > 3.8) {
      dynamicIndicators.push({
        id: 'ind-dyn-entropy',
        category: 'entropy',
        severity: 'medium',
        title: 'Unusually High Character Entropy',
        description:
          'Randomized or complex character sequence typical of automated disposable domains.',
      })
    }

    if (dynamicIndicators.length > 0) {
      return {
        url: rawInput,
        hostname,
        normalizedHostname: hostname,
        isPunycode: puny,
        punycodeDecoded: decodePunycode(hostname),
        riskLevel: 'suspicious',
        riskScore: 68,
        statusExplanation:
          'Structural anomaly detected: Hostname displays unusual character encoding or high entropy.',
        indicators: dynamicIndicators,
        analyzedAt: new Date().toISOString(),
        isMockVerdict: true,
      }
    }

    // Empty or non-threatening in mock catalog:
    // IMPORTANT: Never label as verified safe!
    const isInternalPage =
      hostname === '' ||
      rawInput.startsWith('chrome://') ||
      rawInput.startsWith('edge://') ||
      rawInput.startsWith('about:')

    if (isInternalPage) {
      return {
        url: rawInput,
        hostname: hostname || 'Browser Internal',
        normalizedHostname: hostname,
        isPunycode: false,
        riskLevel: 'unknown',
        riskScore: 0,
        statusExplanation:
          'Browser internal or system page. External web protection does not apply.',
        indicators: [],
        analyzedAt: new Date().toISOString(),
        isMockVerdict: true,
      }
    }

    return {
      url: rawInput,
      hostname,
      normalizedHostname: hostname,
      isPunycode: false,
      riskLevel: 'low_risk',
      riskScore: 12,
      statusExplanation:
        'No known lookalike patterns or homoglyphs found in Phase 1 mock dataset. Caution: Not an official safety guarantee.',
      indicators: [
        {
          id: 'ind-unverified',
          category: 'reputation',
          severity: 'info',
          title: 'Unverified Third-Party Website',
          description:
            'Phase 1 foundation mode does not certify security. Always verify the address bar independently.',
        },
      ],
      analyzedAt: new Date().toISOString(),
      isMockVerdict: true,
    }
  },
}
