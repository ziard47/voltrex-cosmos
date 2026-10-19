import type { Verdict } from '@/engine/types'

/**
 * Manages Chrome Action badge state and tooltip text per tab.
 */
export const badgeManager = {
  async setBadge(tabId: number, verdict: Verdict): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.action?.setBadgeText) {
      return
    }

    try {
      switch (verdict) {
        case 'MALICIOUS':
          await chrome.action.setBadgeText({ tabId, text: '!' })
          await chrome.action.setBadgeBackgroundColor({ tabId, color: '#ef4444' }) // red-500
          await chrome.action.setTitle({
            tabId,
            title: 'Voltrex Cosmos: Suspected High Threat Impersonation',
          })
          break

        case 'SUSPICIOUS':
          await chrome.action.setBadgeText({ tabId, text: '?' })
          await chrome.action.setBadgeBackgroundColor({ tabId, color: '#f59e0b' }) // amber-500
          await chrome.action.setTitle({
            tabId,
            title: 'Voltrex Cosmos: Suspicious Domain Characteristics',
          })
          break

        case 'LOW_RISK':
          await chrome.action.setBadgeText({ tabId, text: '' })
          await chrome.action.setTitle({
            tabId,
            title: 'Voltrex Cosmos: Official or Verified Low Risk',
          })
          break

        case 'UNKNOWN':
        default:
          await chrome.action.setBadgeText({ tabId, text: '' })
          await chrome.action.setTitle({
            tabId,
            title: 'Voltrex Cosmos: Active Domain Protection',
          })
          break
      }
    } catch {
      // Ignore errors for tabs that may have closed in the meantime
    }
  },

  async clearBadge(tabId: number): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.action?.setBadgeText) {
      return
    }
    try {
      await chrome.action.setBadgeText({ tabId, text: '' })
    } catch {
      // Ignore
    }
  },
}
