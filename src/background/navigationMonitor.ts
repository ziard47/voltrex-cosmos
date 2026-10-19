import { defaultDomainEngine } from '@/engine'
import { parseHostname } from '@/engine/parser/hostnameParser'
import { storageService } from '@/services/storageService'
import { defaultBypassManager, BypassManager } from './bypassManager'
import { badgeManager } from './badgeManager'
import type { RecentDetection } from '@/types/domain'

/**
 * Valid schemes that Voltrex Cosmos actively monitors.
 * All other schemes (chrome, chrome-extension, edge, about, javascript, data, file) are safely ignored.
 */
const MONITORED_SCHEMES = new Set(['http:', 'https:'])

export interface NavigationMonitorOptions {
  bypassManager?: BypassManager
}

/**
 * Evaluates whether a URL should be inspected.
 * Returns the parsed URL if valid and monitored, or null if it should be skipped.
 */
export function validateMonitoredUrl(rawUrl: string): URL | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null

  try {
    const url = new URL(rawUrl)
    if (!MONITORED_SCHEMES.has(url.protocol)) {
      return null
    }
    // Reject malformed hostnames or localhost
    if (!url.hostname || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return null
    }
    return url
  } catch {
    return null
  }
}

/**
 * Core navigation inspector that evaluates top-level web requests and determines
 * if a security warning should be displayed.
 */
export class NavigationMonitor {
  private bypassManager: BypassManager

  constructor(options: NavigationMonitorOptions = {}) {
    this.bypassManager = options.bypassManager || defaultBypassManager
  }

  /**
   * Main entrypoint for chrome.webNavigation.onBeforeNavigate events.
   */
  async handleNavigation(details: {
    tabId: number
    url: string
    frameId: number
  }): Promise<{ intercepted: boolean; warningUrl?: string; reason?: string }> {
    // 1. Only monitor top-level navigation (frameId === 0)
    if (details.frameId !== 0 || details.tabId <= 0) {
      return { intercepted: false, reason: 'subframe_or_invalid_tab' }
    }

    // 2. Prevent infinite warning loops: ignore warning page and extension URLs
    if (
      details.url.includes('/src/warning/index.html') ||
      details.url.startsWith('chrome-extension://')
    ) {
      return { intercepted: false, reason: 'extension_internal_page' }
    }

    // 3. Validate scheme and URL structure
    const validUrl = validateMonitoredUrl(details.url)
    if (!validUrl) {
      return { intercepted: false, reason: 'unsupported_scheme_or_format' }
    }

    const hostname = validUrl.hostname
    const parsed = parseHostname(hostname)
    const displayHost = parsed.displayHostname || parsed.hostname

    // 4. Check if user previously initiated an explicit warning bypass for this tab & hostname
    if (
      this.bypassManager.isBypassed(details.tabId, hostname) ||
      this.bypassManager.isBypassed(details.tabId, displayHost)
    ) {
      return { intercepted: false, reason: 'user_session_bypass' }
    }

    // 5. Read current user settings from persistent storage
    const settings = await storageService.getSettings()
    if (!settings.protectionEnabled) {
      await badgeManager.clearBadge(details.tabId)
      return { intercepted: false, reason: 'protection_disabled' }
    }

    // 6. Check user allowlist (matching either wire Punycode or display Unicode representation)
    const isAllowlisted =
      (await storageService.isAllowlisted(hostname)) ||
      (await storageService.isAllowlisted(displayHost))
    if (isAllowlisted) {
      await badgeManager.setBadge(details.tabId, 'LOW_RISK')
      return { intercepted: false, reason: 'allowlisted' }
    }

    // 7. Execute deterministic engine analysis
    const result = await defaultDomainEngine.analyze(details.url, {
      isAllowlisted: false,
      checkThreatIntel: settings.threatIntelEnabled,
    })

    // Update extension badge according to verdict
    await badgeManager.setBadge(details.tabId, result.verdict)

    // 8. Decide whether to trigger the warning interface
    let shouldIntercept = false

    if (result.verdict === 'MALICIOUS') {
      shouldIntercept = settings.blockMaliciousAutomatically
    } else if (result.verdict === 'SUSPICIOUS') {
      if (settings.sensitivity === 'paranoid') {
        shouldIntercept = true
      } else if (settings.warnOnSuspicious) {
        shouldIntercept = true
      }
    }

    if (shouldIntercept) {
      // Record detection in persistent recent history
      const recentEntry: RecentDetection = {
        id: `det-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        hostname: result.parsed.displayHostname || result.parsed.hostname,
        riskLevel: result.verdict === 'MALICIOUS' ? 'malicious' : 'suspicious',
        detectedAt: new Date().toISOString(),
        matchedTarget: result.impersonatedBrand?.primaryDomain,
        indicatorCount: result.findings.length,
      }
      await storageService.addRecentDetection(recentEntry)

      // Construct safe, strictly validated warning URL
      const displayHost = result.parsed.displayHostname || result.parsed.hostname
      const warningUrl = this.buildWarningUrl(displayHost, details.url)

      // In browser runtime, update the tab to redirect to warning page
      if (typeof chrome !== 'undefined' && chrome.tabs?.update) {
        try {
          await chrome.tabs.update(details.tabId, { url: warningUrl })
        } catch {
          // Tab may have navigated elsewhere or closed
        }
      }

      return {
        intercepted: true,
        warningUrl,
        reason: `verdict_${result.verdict.toLowerCase()}`,
      }
    }

    return {
      intercepted: false,
      reason: `verdict_${result.verdict.toLowerCase()}`,
    }
  }

  /**
   * Safely constructs the warning page URL with validated query parameters.
   */
  buildWarningUrl(targetHostname: string, originalUrl: string): string {
    const parsed = parseHostname(targetHostname)
    const safeTarget = parsed.displayHostname || parsed.hostname

    const basePath =
      typeof chrome !== 'undefined' && chrome.runtime?.getURL
        ? chrome.runtime.getURL('src/warning/index.html')
        : '/src/warning/index.html'

    const params = new URLSearchParams()
    params.set('target', safeTarget)
    params.set('originalUrl', originalUrl)

    return `${basePath}?${params.toString()}`
  }
}

export const defaultNavigationMonitor = new NavigationMonitor()
