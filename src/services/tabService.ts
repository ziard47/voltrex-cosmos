import { normalizeHostname } from '@/utils/domain'
import type { BypassWarningMessage, OpenSettingsMessage } from '@/types/messages'

export interface ActiveTabInfo {
  id?: number
  url: string
  hostname: string
  title: string
  isRestricted: boolean
}

const DEFAULT_DEV_TAB: ActiveTabInfo = {
  id: 1,
  url: 'https://pаypal.com/account/login',
  hostname: 'pаypal.com',
  title: 'Demonstration Page — Lookalike Phishing Scenario',
  isRestricted: false,
}

export const tabService = {
  async getActiveTab(): Promise<ActiveTabInfo> {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
            resolve(DEFAULT_DEV_TAB)
            return
          }

          const activeTab = tabs[0]
          const id = activeTab?.id
          const url = activeTab?.url || ''
          const title = activeTab?.title || ''
          const hostname = normalizeHostname(url)

          const isRestricted =
            url.startsWith('chrome://') ||
            url.startsWith('chrome-extension://') ||
            url.startsWith('edge://') ||
            url.startsWith('about:') ||
            url.startsWith('view-source:')

          resolve({
            id,
            url,
            hostname,
            title,
            isRestricted,
          })
        })
      })
    }

    return DEFAULT_DEV_TAB
  },

  async openWarningPage(hostname: string): Promise<void> {
    const warningUrl = chrome?.runtime?.getURL
      ? chrome.runtime.getURL(
          `src/warning/index.html?target=${encodeURIComponent(hostname)}`
        )
      : `/src/warning/index.html?target=${encodeURIComponent(hostname)}`

    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      await chrome.tabs.create({ url: warningUrl })
    } else {
      window.open(warningUrl, '_blank')
    }
  },

  async openSettingsPage(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      const msg: OpenSettingsMessage = { type: 'OPEN_SETTINGS' }
      chrome.runtime.sendMessage(msg)
    } else {
      const settingsUrl = chrome?.runtime?.getURL
        ? chrome.runtime.getURL('src/settings/index.html')
        : '/src/settings/index.html'
      window.open(settingsUrl, '_blank')
    }
  },

  async requestBypass(hostname: string, tabId?: number): Promise<boolean> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      return new Promise((resolve) => {
        const msg: BypassWarningMessage = {
          type: 'BYPASS_WARNING',
          hostname,
          tabId,
        }
        chrome.runtime.sendMessage(msg, (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            resolve(false)
          } else {
            resolve(true)
          }
        })
      })
    }
    return true
  },
}
