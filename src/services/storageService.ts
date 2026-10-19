import { DEFAULT_SETTINGS, type UserSettings } from '@/types/settings'
import type { RecentDetection } from '@/types/domain'
import { normalizeHostname } from '@/utils/domain'
import { parseHostname } from '@/engine/parser/hostnameParser'

const SETTINGS_KEY = 'cosmos_user_settings'
const RECENT_DETECTIONS_KEY = 'cosmos_recent_detections'

const MAX_RECENT_DETECTIONS = 20
const RETENTION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000 // 7 days bounded retention

const MOCK_INITIAL_DETECTIONS: RecentDetection[] = [
  {
    id: 'det-1',
    hostname: 'pаypal.com',
    riskLevel: 'malicious',
    detectedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min ago
    matchedTarget: 'paypal.com',
    indicatorCount: 3,
  },
  {
    id: 'det-2',
    hostname: 'g00gle-security-login.xyz',
    riskLevel: 'malicious',
    detectedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 1 hour ago
    matchedTarget: 'google.com',
    indicatorCount: 4,
  },
  {
    id: 'det-3',
    hostname: 'chase-account-verify.net',
    riskLevel: 'suspicious',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    matchedTarget: 'chase.com',
    indicatorCount: 2,
  },
  {
    id: 'det-4',
    hostname: 'microsoft365-admin-portal.tk',
    riskLevel: 'malicious',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    matchedTarget: 'microsoft.com',
    indicatorCount: 3,
  },
]

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

function pruneExpiredDetections(detections: RecentDetection[]): RecentDetection[] {
  const now = Date.now()
  return detections
    .filter((d) => {
      try {
        const time = new Date(d.detectedAt).getTime()
        return !isNaN(time) && now - time < RETENTION_PERIOD_MS
      } catch {
        return false
      }
    })
    .slice(0, MAX_RECENT_DETECTIONS)
}

export const storageService = {
  async getSettings(): Promise<UserSettings> {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([SETTINGS_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('Error reading chrome storage:', chrome.runtime.lastError)
            resolve(DEFAULT_SETTINGS)
            return
          }
          const saved = result[SETTINGS_KEY] as UserSettings | undefined
          resolve(saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS)
        })
      })
    }

    // Fallback for tests & web development
    try {
      const item = localStorage.getItem(SETTINGS_KEY)
      return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  },

  async updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings()
    const updated: UserSettings = { ...current, ...partial }

    if (hasChromeStorage()) {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [SETTINGS_KEY]: updated }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      })
    } else {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('Failed to write to localStorage', err)
      }
    }

    return updated
  },

  async getAllowlist(): Promise<string[]> {
    const settings = await this.getSettings()
    return settings.allowlist
  },

  async addAllowlistDomain(rawDomain: string): Promise<string[]> {
    const normalized = normalizeHostname(rawDomain)
    if (!normalized) return this.getAllowlist()

    const settings = await this.getSettings()
    if (!settings.allowlist.includes(normalized)) {
      const updatedList = [...settings.allowlist, normalized]
      await this.updateSettings({ allowlist: updatedList })
      return updatedList
    }
    return settings.allowlist
  },

  async removeAllowlistDomain(domainToRemove: string): Promise<string[]> {
    const normalized = normalizeHostname(domainToRemove)
    const settings = await this.getSettings()
    const updatedList = settings.allowlist.filter((d) => d !== normalized)
    await this.updateSettings({ allowlist: updatedList })
    return updatedList
  },

  /**
   * Evaluates if a domain matches the user's allowlist.
   *
   * SECURITY GUARANTEE:
   * 1. Exact match against normalized hostname or registrable domain is required.
   * 2. Subdomains only match if their validated registrable domain equals the allowlisted entry.
   * 3. A lookalike or unrelated domain embedding a brand subdomain (e.g. google.com.phish.com)
   *    will NEVER match an allowlist entry for "google.com".
   */
  async isAllowlisted(rawDomain: string): Promise<boolean> {
    const normalized = normalizeHostname(rawDomain)
    if (!normalized) return false

    const allowlist = await this.getAllowlist()
    if (allowlist.length === 0) return false

    // Direct match against allowlist entry
    if (allowlist.includes(normalized)) {
      return true
    }

    // Parse registrable domain using the Public Suffix List
    const parsed = parseHostname(normalized)
    const host = parsed.hostname
    const displayHost = parsed.displayHostname
    const registrable = parsed.registrableDomain

    for (const entry of allowlist) {
      const normEntry = normalizeHostname(entry)
      if (!normEntry) continue

      const parsedEntry = parseHostname(normEntry)

      // Direct match on punycode hostname or Unicode display representation
      if (
        host === normEntry ||
        displayHost === normEntry ||
        host === parsedEntry.hostname ||
        (displayHost && displayHost === parsedEntry.displayHostname)
      ) {
        return true
      }

      // If allowlist contains a registrable domain (e.g. "google.com"),
      // legitimate subdomains like "mail.google.com" match ONLY IF their actual
      // registrable domain matches the entry.
      const entryRegistrable = parsedEntry.registrableDomain || parsedEntry.hostname
      if (
        registrable &&
        (registrable === normEntry || registrable === entryRegistrable) &&
        (host.endsWith('.' + parsedEntry.hostname) ||
          (displayHost &&
            displayHost.endsWith('.' + (parsedEntry.displayHostname || normEntry))))
      ) {
        return true
      }
    }

    return false
  },

  async getRecentDetections(): Promise<RecentDetection[]> {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([RECENT_DETECTIONS_KEY], (result) => {
          if (chrome.runtime.lastError) {
            resolve(pruneExpiredDetections(MOCK_INITIAL_DETECTIONS))
            return
          }
          const saved = result[RECENT_DETECTIONS_KEY] as RecentDetection[] | undefined
          const items = saved && Array.isArray(saved) ? saved : MOCK_INITIAL_DETECTIONS
          resolve(pruneExpiredDetections(items))
        })
      })
    }

    try {
      const item = localStorage.getItem(RECENT_DETECTIONS_KEY)
      const parsed = item ? JSON.parse(item) : MOCK_INITIAL_DETECTIONS
      return pruneExpiredDetections(
        Array.isArray(parsed) ? parsed : MOCK_INITIAL_DETECTIONS
      )
    } catch {
      return pruneExpiredDetections(MOCK_INITIAL_DETECTIONS)
    }
  },

  async addRecentDetection(detection: RecentDetection): Promise<RecentDetection[]> {
    const current = await this.getRecentDetections()
    const rawUpdated = [
      detection,
      ...current.filter((d) => d.hostname !== detection.hostname),
    ]
    const updated = pruneExpiredDetections(rawUpdated)

    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [RECENT_DETECTIONS_KEY]: updated }, () => resolve())
      })
    } else {
      try {
        localStorage.setItem(RECENT_DETECTIONS_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
    }

    return updated
  },

  async clearRecentDetections(): Promise<void> {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.remove([RECENT_DETECTIONS_KEY], () => resolve())
      })
    } else {
      localStorage.removeItem(RECENT_DETECTIONS_KEY)
    }
  },
}
