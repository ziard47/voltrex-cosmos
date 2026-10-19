import { describe, it, expect } from 'vitest'
import { parseHostname, toUnicodeDisplay } from './hostnameParser'

describe('hostnameParser', () => {
  it('parses standard web URLs with protocol, path, and port', () => {
    const result = parseHostname('https://www.example.com:8443/login?user=test#section')
    expect(result.isMalformed).toBe(false)
    expect(result.isUnsupportedScheme).toBe(false)
    expect(result.hostname).toBe('www.example.com')
    expect(result.registrableDomain).toBe('example.com')
    expect(result.subdomain).toBe('www')
    expect(result.publicSuffix).toBe('com')
    expect(result.domainWithoutSuffix).toBe('example')
  })

  it('correctly resolves multi-level public suffixes using PSL', () => {
    const result = parseHostname('https://portal.sub.domain.co.uk/index')
    expect(result.hostname).toBe('portal.sub.domain.co.uk')
    expect(result.registrableDomain).toBe('domain.co.uk')
    expect(result.publicSuffix).toBe('co.uk')
    expect(result.subdomain).toBe('portal.sub')
    expect(result.domainWithoutSuffix).toBe('domain')
  })

  it('strips trailing dots from hostnames', () => {
    const result = parseHostname('https://google.com.')
    expect(result.hostname).toBe('google.com')
    expect(result.registrableDomain).toBe('google.com')
  })

  it('handles Punycode encoded hostnames and extracts Unicode display', () => {
    // xn--pypal-4ve.com decodes to pаypal.com (Cyrillic 'а')
    const result = parseHostname('https://xn--pypal-4ve.com/account')
    expect(result.isIdn).toBe(true)
    expect(result.hostname).toBe('xn--pypal-4ve.com')
    expect(result.displayHostname).toBe('pаypal.com')
    expect(result.registrableDomain).toBe('xn--pypal-4ve.com')
  })

  it('handles bare hostnames without scheme', () => {
    const result = parseHostname('github.com/microsoft/vscode')
    expect(result.hostname).toBe('github.com')
    expect(result.registrableDomain).toBe('github.com')
  })

  it('detects IPv4 addresses', () => {
    const result = parseHostname('http://192.168.1.1:8080/admin')
    expect(result.isIp).toBe(true)
    expect(result.isIpv4).toBe(true)
    expect(result.isIpv6).toBe(false)
    expect(result.hostname).toBe('192.168.1.1')
    expect(result.registrableDomain).toBe('192.168.1.1')
    expect(result.publicSuffix).toBeNull()
  })

  it('detects IPv6 addresses', () => {
    const result = parseHostname('http://[2001:db8::1]:80/')
    expect(result.isIp).toBe(true)
    expect(result.isIpv6).toBe(true)
    expect(result.isIpv4).toBe(false)
    expect(result.hostname).toBe('[2001:db8::1]')
  })

  it('rejects unsupported or dangerous schemes', () => {
    const jsResult = parseHostname('javascript:alert(document.cookie)')
    expect(jsResult.isUnsupportedScheme).toBe(true)
    expect(jsResult.isMalformed).toBe(false)

    const dataResult = parseHostname('data:text/html,<h1>Phishing</h1>')
    expect(dataResult.isUnsupportedScheme).toBe(true)

    const fileResult = parseHostname('file:///etc/passwd')
    expect(fileResult.isUnsupportedScheme).toBe(true)
  })

  it('marks empty or malformed values as malformed', () => {
    expect(parseHostname('').isMalformed).toBe(true)
    expect(parseHostname('   ').isMalformed).toBe(true)
  })

  it('converts punycode to unicode display via toUnicodeDisplay', () => {
    expect(toUnicodeDisplay('xn--pypal-4ve.com')).toBe('pаypal.com')
    expect(toUnicodeDisplay('example.com')).toBe('example.com')
  })
})
