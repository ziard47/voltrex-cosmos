import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NavigationMonitor, validateMonitoredUrl } from '@/background/navigationMonitor'
import { BypassManager } from '@/background/bypassManager'
import { storageService } from '@/services/storageService'
import { DomainIntelligenceEngine } from '@/engine/engine'
import { MockThreatIntelProvider } from '@/engine/reputation/mockProvider'
import { MemoryThreatIntelCache } from '@/engine/reputation/memoryCache'
import { isValidExtensionMessage } from '@/types/messages'
import { DEFAULT_SETTINGS } from '@/types/settings'

describe('Phase 3 Integration: Chrome Navigation & Protection Workflow', () => {
  let bypassManager: BypassManager
  let monitor: NavigationMonitor

  beforeEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    bypassManager = new BypassManager()
    monitor = new NavigationMonitor({ bypassManager })
    await storageService.updateSettings(DEFAULT_SETTINGS)
    await storageService.clearRecentDetections()
  })

  describe('1. Normal Web Navigation', () => {
    it('does not intercept standard benign domains', async () => {
      const result = await monitor.handleNavigation({
        tabId: 1,
        frameId: 0,
        url: 'https://en.wikipedia.org/wiki/Computer_security',
      })

      expect(result.intercepted).toBe(false)
      expect(result.reason).toBe('verdict_unknown')
    })

    it('does not intercept subframes (frameId > 0)', async () => {
      const result = await monitor.handleNavigation({
        tabId: 1,
        frameId: 1, // iframe
        url: 'https://pаypal.com/embedded',
      })

      expect(result.intercepted).toBe(false)
      expect(result.reason).toBe('subframe_or_invalid_tab')
    })
  })

  describe('2. Suspicious Lookalike Navigation', () => {
    it('intercepts Cyrillic homoglyph lookalikes and builds safe warning URL', async () => {
      const result = await monitor.handleNavigation({
        tabId: 2,
        frameId: 0,
        url: 'https://pаypal.com/signin',
      })

      expect(result.intercepted).toBe(true)
      expect(result.warningUrl).toBeDefined()
      expect(result.warningUrl).toContain('target=p%D0%B0ypal.com')
      expect(result.warningUrl).toContain(
        'originalUrl=https%3A%2F%2Fp%D0%B0ypal.com%2Fsignin'
      )

      // Verifies recent detection was logged to persistent storage
      const recent = await storageService.getRecentDetections()
      expect(recent.some((d) => d.hostname === 'pаypal.com')).toBe(true)
    })

    it('intercepts character insertion lookalikes', async () => {
      const result = await monitor.handleNavigation({
        tabId: 3,
        frameId: 0,
        url: 'https://paypaal.com/checkout',
      })

      expect(result.intercepted).toBe(true)
      expect(result.warningUrl).toContain('target=paypaal.com')
    })
  })

  describe('3. Confirmed Malicious Verdicts via Threat Intelligence Provider', () => {
    it('integrates with external provider and intercepts when reputation verdict is malicious', async () => {
      const mockProvider = new MockThreatIntelProvider({
        maliciousDomains: ['phish-lure-attack.com'],
      })
      const engine = new DomainIntelligenceEngine({
        threatIntelProvider: mockProvider,
        threatIntelCache: new MemoryThreatIntelCache(),
        enableExternalLookups: true,
      })

      const engineResult = await engine.analyze('https://phish-lure-attack.com/login', {
        checkThreatIntel: true,
      })

      expect(engineResult.verdict).toBe('MALICIOUS')
      expect(engineResult.threatIntelStatus).toBe('QUERIED')
      expect(engineResult.findings.some((f) => f.id === 'find-reputation-external')).toBe(
        true
      )
    })
  })

  describe('4. Redirect Chains & Successive Navigations', () => {
    it('handles multiple navigation events on the same tab cleanly', async () => {
      // Step 1: Navigating to safe site
      const nav1 = await monitor.handleNavigation({
        tabId: 5,
        frameId: 0,
        url: 'https://duckduckgo.com',
      })
      expect(nav1.intercepted).toBe(false)

      // Step 2: Redirected to a homoglyph phishing site
      const nav2 = await monitor.handleNavigation({
        tabId: 5,
        frameId: 0,
        url: 'https://g00gle.com',
      })
      expect(nav2.intercepted).toBe(true)

      // Step 3: Navigating to legitimate brand
      const nav3 = await monitor.handleNavigation({
        tabId: 5,
        frameId: 0,
        url: 'https://google.com',
      })
      expect(nav3.intercepted).toBe(false)
    })
  })

  describe('5. Browser-Internal and Unsupported URLs', () => {
    it('ignores chrome://, about:, and extension pages without executing analysis', async () => {
      const urls = [
        'chrome://extensions',
        'chrome://settings',
        'about:blank',
        'edge://version',
        'chrome-extension://abcdefg/src/warning/index.html',
        'view-source:https://google.com',
      ]

      for (const url of urls) {
        const result = await monitor.handleNavigation({
          tabId: 1,
          frameId: 0,
          url,
        })
        expect(result.intercepted).toBe(false)
      }
    })
  })

  describe('6. Disabled Protection Preference', () => {
    it('does not intercept lookalike navigation when protection is disabled by user', async () => {
      await storageService.updateSettings({ protectionEnabled: false })

      const result = await monitor.handleNavigation({
        tabId: 4,
        frameId: 0,
        url: 'https://pаypal.com/login',
      })

      expect(result.intercepted).toBe(false)
      expect(result.reason).toBe('protection_disabled')
    })
  })

  describe('7. User Allowlisting & Subdomain Spoofing Protection', () => {
    it('honors user allowlist as an explicit override', async () => {
      await storageService.addAllowlistDomain('pаypal.com')

      const result = await monitor.handleNavigation({
        tabId: 6,
        frameId: 0,
        url: 'https://pаypal.com/account',
      })

      expect(result.intercepted).toBe(false)
      expect(result.reason).toBe('allowlisted')
    })

    it('NEVER allows an attacker subdomain to piggyback on an allowlisted domain', async () => {
      // User has allowlisted "paypal.com"
      await storageService.addAllowlistDomain('paypal.com')

      // Attacker owns evil-host.com with a deceptive "paypal.com" subdomain
      const isAllowed = await storageService.isAllowlisted('paypal.com.evil-host.com')
      expect(isAllowed).toBe(false)

      const result = await monitor.handleNavigation({
        tabId: 7,
        frameId: 0,
        url: 'https://paypal.com.evil-host.com',
      })

      // Must be evaluated and flagged, NOT bypassed as allowlisted!
      expect(result.reason).not.toBe('allowlisted')
    })
  })

  describe('8. Service Worker Restarts & Rehydration', () => {
    it('correctly re-hydrates persisted user settings across worker lifecycles', async () => {
      await storageService.updateSettings({
        sensitivity: 'paranoid',
        warnOnSuspicious: true,
      })

      // Simulate a service worker restart with new NavigationMonitor instance
      const freshMonitor = new NavigationMonitor()
      const settings = await storageService.getSettings()

      expect(settings.sensitivity).toBe('paranoid')
      expect(settings.warnOnSuspicious).toBe(true)

      // Test interception under paranoid mode
      const result = await freshMonitor.handleNavigation({
        tabId: 8,
        frameId: 0,
        url: 'https://chase-account-verify.net',
      })
      expect(result.intercepted).toBe(true)
    })
  })

  describe('9. Failed Threat Intelligence Requests & Timeouts', () => {
    it('reports unavailable rather than safe when provider throws or is offline', async () => {
      const offlineProvider = new MockThreatIntelProvider({
        isOnline: false,
      })

      const status = await offlineProvider.getStatus()
      expect(status.isOnline).toBe(false)

      const lookup = await offlineProvider.lookupDomain('some-unknown-site.org')
      expect(lookup.isAvailable).toBe(false)
      expect(lookup.reputationVerdict).toBe('unknown')

      const engine = new DomainIntelligenceEngine({
        threatIntelProvider: offlineProvider,
        enableExternalLookups: true,
      })

      const result = await engine.analyze('https://some-unknown-site.org', {
        checkThreatIntel: true,
      })

      expect(result.threatIntelStatus).toBe('UNAVAILABLE')
      // Uncertainty is maintained honestly:
      expect(result.verdict).toBe('UNKNOWN')
    })

    it('handles aborted requests cleanly when timeout occurs', async () => {
      const timeoutProvider = new MockThreatIntelProvider({
        simulateDelayMs: 200,
      })

      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10)

      await expect(
        timeoutProvider.lookupDomain('slow-response.com', {
          signal: controller.signal,
        })
      ).rejects.toThrow()
    })
  })

  describe('10. Invalid Redirect Targets & Open Redirect Prevention', () => {
    it('rejects javascript: and data: schemes in validateMonitoredUrl', () => {
      expect(validateMonitoredUrl('javascript:alert(1)')).toBeNull()
      expect(validateMonitoredUrl('data:text/html,<h1>PWNED</h1>')).toBeNull()
      expect(validateMonitoredUrl('file:///etc/passwd')).toBeNull()
      expect(validateMonitoredUrl('')).toBeNull()
      expect(validateMonitoredUrl('not-a-url')).toBeNull()
    })

    it('safely builds warning URLs without unescaped script injection', () => {
      const warningUrl = monitor.buildWarningUrl(
        'evil.com<script>alert(1)</script>',
        'https://evil.com/page?q="><script>'
      )

      expect(warningUrl).not.toContain('<script>')
      expect(warningUrl).toContain('evil.com')
    })
  })

  describe('11. Warning Bypass & Infinite Redirect Loop Prevention', () => {
    it('prevents redirect loop when user explicitly bypasses the warning for a tab', async () => {
      const tabId = 42
      const targetDomain = 'pаypal.com'

      // First navigation: intercepted
      const nav1 = await monitor.handleNavigation({
        tabId,
        frameId: 0,
        url: `https://${targetDomain}/login`,
      })
      expect(nav1.intercepted).toBe(true)

      // User chooses "Proceed anyway" on the warning page
      bypassManager.addBypass(tabId, targetDomain)
      expect(bypassManager.isBypassed(tabId, targetDomain)).toBe(true)

      // Subsequent navigation to that destination on the same tab: permitted
      const nav2 = await monitor.handleNavigation({
        tabId,
        frameId: 0,
        url: `https://${targetDomain}/login`,
      })
      expect(nav2.intercepted).toBe(false)
      expect(nav2.reason).toBe('user_session_bypass')

      // Navigation to the extension warning page itself is never intercepted (no infinite loop)
      const warningPageNav = await monitor.handleNavigation({
        tabId,
        frameId: 0,
        url: 'chrome-extension://my-id/src/warning/index.html?target=p%D0%B0ypal.com',
      })
      expect(warningPageNav.intercepted).toBe(false)

      // Closing the tab cleans up the bypass
      bypassManager.removeTab(tabId)
      expect(bypassManager.isBypassed(tabId, targetDomain)).toBe(false)
    })
  })

  describe('12. Legitimate Regional Domains', () => {
    it('does not intercept verified regional domains for recognized brands', async () => {
      const regionalDomains = [
        'https://www.google.co.uk',
        'https://www.amazon.co.jp',
        'https://www.paypal.ca',
      ]

      for (const url of regionalDomains) {
        const result = await monitor.handleNavigation({
          tabId: 9,
          frameId: 0,
          url,
        })
        expect(result.intercepted).toBe(false)
      }
    })
  })

  describe('13. Typed Extension Message Validation', () => {
    it('validates correct extension messages and rejects malformed objects', () => {
      expect(
        isValidExtensionMessage({ type: 'ANALYZE_URL', url: 'https://example.com' })
      ).toBe(true)
      expect(isValidExtensionMessage({ type: 'GET_SETTINGS' })).toBe(true)
      expect(
        isValidExtensionMessage({ type: 'BYPASS_WARNING', hostname: 'bad.com' })
      ).toBe(true)
      expect(isValidExtensionMessage({ type: 'ADD_ALLOWLIST', domain: 'safe.org' })).toBe(
        true
      )

      // Malformed or invalid messages
      expect(isValidExtensionMessage(null)).toBe(false)
      expect(isValidExtensionMessage(undefined)).toBe(false)
      expect(isValidExtensionMessage({})).toBe(false)
      expect(isValidExtensionMessage({ type: 'UNKNOWN_MSG_TYPE' })).toBe(false)
      expect(isValidExtensionMessage({ type: 'ANALYZE_URL', url: 12345 })).toBe(false)
      expect(isValidExtensionMessage({ type: 'BYPASS_WARNING', hostname: {} })).toBe(
        false
      )
    })
  })
})
