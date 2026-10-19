import type { RiskLevel } from '@/types/domain'

/**
 * Normalizes raw input (URL or host string) down to lowercase hostname.
 * Strips protocols (http/https), port numbers, URL paths, queries, and trailing dots.
 */
export function normalizeHostname(input: string): string {
  if (!input || typeof input !== 'string') return ''

  let cleaned = input.trim()

  // Remove protocol if present
  if (cleaned.includes('://')) {
    try {
      const parsed = new URL(cleaned)
      cleaned = parsed.hostname
    } catch {
      cleaned = cleaned.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    }
  }

  // Remove userinfo (e.g. user:pass@)
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@').pop() ?? ''
  }

  // Remove path, query, hash
  cleaned = cleaned.split('/')[0] ?? ''
  cleaned = cleaned.split('?')[0] ?? ''
  cleaned = cleaned.split('#')[0] ?? ''

  // Remove port
  if (cleaned.includes(':') && !cleaned.includes(']')) {
    cleaned = cleaned.split(':')[0] ?? ''
  }

  // Strip trailing dot
  cleaned = cleaned.replace(/\.$/, '')

  return cleaned.toLowerCase()
}

/**
 * Validates domain format according to RFC 1035 / standard host conventions.
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false
  const trimmed = domain.trim()
  if (trimmed.includes('://') || trimmed.includes('/') || trimmed.includes(' '))
    return false

  const normalized = normalizeHostname(trimmed)
  if (normalized.length < 3 || normalized.length > 253) return false

  // Regex matching valid domain with at least one dot or localhost
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  return domainRegex.test(normalized) || normalized === 'localhost'
}

/**
 * Detects if a domain contains punycode labels (xn--)
 */
export function isPunycode(domain: string): boolean {
  if (!domain) return false
  return domain
    .toLowerCase()
    .split('.')
    .some((part) => part.startsWith('xn--'))
}

/**
 * Basic punycode detection and decoding fallback for browsers.
 * Uses native URL/Intl domain conversion when available.
 */
export function decodePunycode(domain: string): string {
  if (!domain) return ''
  try {
    // When browser URL or Intl is available, toUnicode handles xn-- conversions
    const url = new URL(`http://${domain}`)
    return url.hostname
  } catch {
    return domain
  }
}

/**
 * Detects homoglyphic or mixed-script characters often used in lookalike attacks
 * (e.g., Cyrillic 'а', 'о', 'е', 'р', 'с' mixed into Latin domains).
 */
export function hasMixedScripts(domain: string): boolean {
  if (!domain) return false
  const cyrillicRegex = /[\u0400-\u04FF]/
  const latinRegex = /[a-zA-Z]/
  return cyrillicRegex.test(domain) && latinRegex.test(domain)
}

/**
 * Calculates Shannon entropy of a string (higher entropy indicates randomized subdomains/phishing paths).
 */
export function calculateEntropy(str: string): number {
  if (!str) return 0
  const len = str.length
  const frequencies = new Map<string, number>()

  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) ?? 0) + 1)
  }

  let entropy = 0
  for (const count of frequencies.values()) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }

  return Number(entropy.toFixed(2))
}

/**
 * Return human-readable label for a risk level
 */
export function getRiskLabel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'unknown':
      return 'Unknown'
    case 'checking':
      return 'Checking...'
    case 'low_risk':
      return 'Low Risk'
    case 'suspicious':
      return 'Suspicious'
    case 'malicious':
      return 'High Threat'
  }
}

/**
 * Return cybersecurity color palette tokens for a risk level
 */
export function getRiskColorTokens(riskLevel: RiskLevel): {
  badgeBg: string
  badgeBorder: string
  textColor: string
  indicatorDot: string
} {
  switch (riskLevel) {
    case 'malicious':
      return {
        badgeBg: 'rgba(239, 68, 68, 0.12)',
        badgeBorder: 'rgba(239, 68, 68, 0.4)',
        textColor: '#f87171',
        indicatorDot: '#ef4444',
      }
    case 'suspicious':
      return {
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
        textColor: '#fbbf24',
        indicatorDot: '#f59e0b',
      }
    case 'low_risk':
      return {
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeBorder: 'rgba(16, 185, 129, 0.4)',
        textColor: '#34d399',
        indicatorDot: '#10b981',
      }
    case 'checking':
      return {
        badgeBg: 'rgba(6, 182, 212, 0.12)',
        badgeBorder: 'rgba(6, 182, 212, 0.4)',
        textColor: '#22d3ee',
        indicatorDot: '#06b6d4',
      }
    case 'unknown':
    default:
      return {
        badgeBg: 'rgba(148, 163, 184, 0.1)',
        badgeBorder: 'rgba(148, 163, 184, 0.25)',
        textColor: '#94a3b8',
        indicatorDot: '#64748b',
      }
  }
}

/**
 * Format timestamp into relative display string
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  } catch {
    return 'Recent'
  }
}
