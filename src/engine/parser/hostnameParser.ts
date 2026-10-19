import { parse as parseTld } from 'tldts'
import punycode from 'punycode/'
import type { ParsedHostname } from '../types'

const UNSUPPORTED_SCHEMES = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'blob:',
  'about:',
])

/**
 * Checks if a string represents an IPv4 address.
 */
function isIPv4(hostname: string): boolean {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(hostname)
}

/**
 * Checks if a string represents an IPv6 address.
 */
function isIPv6(hostname: string): boolean {
  const cleaned = hostname.replace(/^\[|\]$/g, '')
  // Basic IPv6 check with hex segments and colons
  return cleaned.includes(':') && /^[0-9a-fA-F:]+$/.test(cleaned)
}

/**
 * Converts a punycode or ASCII domain to its Unicode display representation.
 */
export function toUnicodeDisplay(hostname: string): string {
  if (!hostname) return ''
  try {
    return punycode.toUnicode(hostname)
  } catch {
    return hostname
  }
}

/**
 * Safely parses any URL or hostname string into structured host components.
 * Adheres to WHATWG URL parsing and Public Suffix List rules.
 */
export function parseHostname(input: string): ParsedHostname {
  const trimmed = (input || '').trim()

  if (!trimmed) {
    return {
      rawInput: input,
      hostname: '',
      displayHostname: '',
      registrableDomain: null,
      displayRegistrableDomain: null,
      subdomain: null,
      publicSuffix: null,
      domainWithoutSuffix: null,
      isIp: false,
      isIpv4: false,
      isIpv6: false,
      isIdn: false,
      isUnsupportedScheme: false,
      isMalformed: true,
      parseError: 'Input is empty',
    }
  }

  if (trimmed.length > 4096) {
    return {
      rawInput: input,
      hostname: '',
      displayHostname: '',
      registrableDomain: null,
      displayRegistrableDomain: null,
      subdomain: null,
      publicSuffix: null,
      domainWithoutSuffix: null,
      isIp: false,
      isIpv4: false,
      isIpv6: false,
      isIdn: false,
      isUnsupportedScheme: false,
      isMalformed: true,
      parseError: 'Input exceeds maximum supported length (4096 bytes)',
    }
  }

  // Check for unsupported or dangerous pseudo-schemes
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)/)
  if (schemeMatch && schemeMatch[1]) {
    const scheme = schemeMatch[1].toLowerCase()
    if (UNSUPPORTED_SCHEMES.has(scheme)) {
      return {
        rawInput: input,
        hostname: '',
        displayHostname: '',
        registrableDomain: null,
        displayRegistrableDomain: null,
        subdomain: null,
        publicSuffix: null,
        domainWithoutSuffix: null,
        isIp: false,
        isIpv4: false,
        isIpv6: false,
        isIdn: false,
        isUnsupportedScheme: true,
        isMalformed: false,
        parseError: `Unsupported URL scheme: ${scheme}`,
      }
    }
  }

  // Normalize URL with WHATWG URL API
  let extractedHost: string

  try {
    // If input already has a scheme (e.g. http:// or https://)
    if (trimmed.includes('://')) {
      extractedHost = new URL(trimmed).hostname
    } else if (trimmed.startsWith('//')) {
      extractedHost = new URL(`https:${trimmed}`).hostname
    } else {
      // Input is a bare host, domain, or host+path
      extractedHost = new URL(`https://${trimmed}`).hostname
    }
  } catch (err) {
    // If standard WHATWG parser failed, check if user entered international chars
    try {
      // In case of unencoded international characters like "http://münchen.de"
      const encoded = encodeURI(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
      extractedHost = new URL(encoded).hostname
    } catch {
      return {
        rawInput: input,
        hostname: '',
        displayHostname: '',
        registrableDomain: null,
        displayRegistrableDomain: null,
        subdomain: null,
        publicSuffix: null,
        domainWithoutSuffix: null,
        isIp: false,
        isIpv4: false,
        isIpv6: false,
        isIdn: false,
        isUnsupportedScheme: false,
        isMalformed: true,
        parseError: err instanceof Error ? err.message : 'Invalid URL or hostname format',
      }
    }
  }

  // Remove trailing dots from hostname (e.g. "example.com." -> "example.com")
  extractedHost = extractedHost.replace(/\.+$/, '').toLowerCase()

  if (!extractedHost) {
    return {
      rawInput: input,
      hostname: '',
      displayHostname: '',
      registrableDomain: null,
      displayRegistrableDomain: null,
      subdomain: null,
      publicSuffix: null,
      domainWithoutSuffix: null,
      isIp: false,
      isIpv4: false,
      isIpv6: false,
      isIdn: false,
      isUnsupportedScheme: false,
      isMalformed: true,
      parseError: 'Hostname extraction resulted in empty string',
    }
  }

  // Check IP addresses
  const ipv4 = isIPv4(extractedHost)
  const ipv6 = isIPv6(extractedHost)
  const isIp = ipv4 || ipv6

  // Detect IDN (Punycode label "xn--" or contains non-ASCII characters)
  const hasPunycode = extractedHost.split('.').some((part) => part.startsWith('xn--'))
  const hasNonAscii = Array.from(extractedHost).some(
    (ch) => (ch.codePointAt(0) ?? 0) > 127
  )
  const isIdn = hasPunycode || hasNonAscii

  // Extract Public Suffix List components via tldts
  const tldResult = parseTld(extractedHost, { allowPrivateDomains: false })

  const registrableDomain = tldResult.domain || (isIp ? extractedHost : null)
  const publicSuffix = tldResult.publicSuffix || null
  const subdomain = tldResult.subdomain || null
  const domainWithoutSuffix = tldResult.domainWithoutSuffix || null

  // Unicode display representation
  const displayHostname = toUnicodeDisplay(extractedHost)
  const displayRegistrableDomain = registrableDomain
    ? toUnicodeDisplay(registrableDomain)
    : null

  return {
    rawInput: input,
    hostname: extractedHost,
    displayHostname,
    registrableDomain,
    displayRegistrableDomain,
    subdomain,
    publicSuffix,
    domainWithoutSuffix,
    isIp,
    isIpv4: ipv4,
    isIpv6: ipv6,
    isIdn,
    isUnsupportedScheme: false,
    isMalformed: false,
  }
}
