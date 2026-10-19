import { normalizeHostname } from '@/utils/domain'
import { parseHostname } from '@/engine/parser/hostnameParser'

export interface BypassEntry {
  hostname: string
  bypassedAt: number
}

const DEFAULT_BYPASS_TTL_MS = 15 * 60 * 1000 // 15 minutes session bypass

/**
 * Manages user-initiated warning overrides per browser tab.
 * Prevents infinite redirect loops when a user explicitly chooses to proceed to an unsafe destination.
 */
export class BypassManager {
  // tabId -> Map<normalizedHostname, timestamp>
  private tabBypasses = new Map<number, Map<string, number>>()

  /**
   * Registers a temporary user bypass for a specific tab and hostname.
   * Stores both Unicode and Punycode representations.
   */
  addBypass(tabId: number, rawHostname: string): void {
    const hostname = normalizeHostname(rawHostname)
    if (!hostname || tabId <= 0) return

    let tabMap = this.tabBypasses.get(tabId)
    if (!tabMap) {
      tabMap = new Map()
      this.tabBypasses.set(tabId, tabMap)
    }

    const now = Date.now()
    tabMap.set(hostname, now)

    const parsed = parseHostname(hostname)
    if (parsed.hostname) {
      tabMap.set(parsed.hostname, now)
    }
    if (parsed.displayHostname) {
      tabMap.set(parsed.displayHostname, now)
    }
  }

  /**
   * Checks whether the user has explicitly bypassed warnings for this tab and hostname.
   * Compares against both Unicode display format and Punycode wire format.
   */
  isBypassed(tabId: number, rawHostname: string, ttlMs = DEFAULT_BYPASS_TTL_MS): boolean {
    const hostname = normalizeHostname(rawHostname)
    if (!hostname || tabId <= 0) return false

    const tabMap = this.tabBypasses.get(tabId)
    if (!tabMap) return false

    const parsed = parseHostname(hostname)
    const candidates = new Set(
      [hostname, parsed.hostname, parsed.displayHostname].filter(Boolean) as string[]
    )

    for (const cand of candidates) {
      const timestamp = tabMap.get(cand)
      if (timestamp) {
        if (Date.now() - timestamp > ttlMs) {
          tabMap.delete(cand)
          return false
        }
        return true
      }
    }

    return false
  }

  /**
   * Cleans up tab state when a tab is closed.
   */
  removeTab(tabId: number): void {
    this.tabBypasses.delete(tabId)
  }

  /**
   * Clears all active bypasses.
   */
  clear(): void {
    this.tabBypasses.clear()
  }
}

export const defaultBypassManager = new BypassManager()
