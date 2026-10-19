import { DEFAULT_SETTINGS } from '../types/settings'
import { isValidExtensionMessage, type ExtensionMessage } from '../types/messages'
import { defaultNavigationMonitor } from './navigationMonitor'
import { defaultBypassManager } from './bypassManager'
import { storageService } from '../services/storageService'
import { detectionService } from '../services/detectionService'

const SETTINGS_KEY = 'cosmos_user_settings'

/**
 * Voltrex Cosmos — Background Service Worker (Manifest V3)
 *
 * Coordinates:
 * 1. Web navigation monitoring and threat evaluation.
 * 2. Tab action badges and risk indicators.
 * 3. User session bypass state to prevent infinite warning loops.
 * 4. Inter-component IPC messaging across popup, warning, and settings.
 */

// Lifecycle: Install & Seed Default Configuration
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      if (!result[SETTINGS_KEY]) {
        chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS })
      }
    })
  }
})

// Navigation Listener: Monitors top-level navigations via chrome.webNavigation
if (typeof chrome !== 'undefined' && chrome.webNavigation?.onBeforeNavigate) {
  chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    try {
      await defaultNavigationMonitor.handleNavigation(details)
    } catch (err) {
      console.warn('[Voltrex Cosmos] Navigation inspection error:', err)
    }
  })
}

// Tab Cleanup: Clean session bypasses when tabs are closed
if (typeof chrome !== 'undefined' && chrome.tabs?.onRemoved) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    defaultBypassManager.removeTab(tabId)
  })
}

// Runtime IPC Message Listener
chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    if (!isValidExtensionMessage(message)) {
      sendResponse({ success: false, error: 'Invalid or malformed message shape' })
      return false
    }

    const typedMsg = message as ExtensionMessage

    handleExtensionMessage(typedMsg, sender)
      .then((data) => {
        sendResponse({ success: true, data })
      })
      .catch((err: Error) => {
        sendResponse({ success: false, error: err.message || 'Unknown error' })
      })

    // Return true to indicate asynchronous response
    return true
  }
)

async function handleExtensionMessage(
  msg: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (msg.type) {
    case 'ANALYZE_URL': {
      return await detectionService.analyzeDomain(msg.url)
    }

    case 'BYPASS_WARNING': {
      const tabId = msg.tabId ?? sender.tab?.id ?? 0
      if (tabId > 0 && msg.hostname) {
        defaultBypassManager.addBypass(tabId, msg.hostname)
        return { bypassed: true, tabId, hostname: msg.hostname }
      }
      return { bypassed: false }
    }

    case 'ADD_ALLOWLIST': {
      return await storageService.addAllowlistDomain(msg.domain)
    }

    case 'REMOVE_ALLOWLIST': {
      return await storageService.removeAllowlistDomain(msg.domain)
    }

    case 'GET_SETTINGS': {
      return await storageService.getSettings()
    }

    case 'UPDATE_SETTINGS': {
      return await storageService.updateSettings(msg.settings)
    }

    case 'CLEAR_RECENT_DETECTIONS': {
      await storageService.clearRecentDetections()
      return { cleared: true }
    }

    case 'OPEN_SETTINGS': {
      if (chrome.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage()
      }
      return { opened: true }
    }

    case 'OPEN_WARNING': {
      const target = msg.hostname || 'pаypal.com'
      const warningUrl = chrome.runtime.getURL(
        `src/warning/index.html?target=${encodeURIComponent(target)}`
      )
      await chrome.tabs.create({ url: warningUrl })
      return { opened: true }
    }

    case 'GET_NAVIGATION_STATE': {
      const isBypassed = defaultBypassManager.isBypassed(msg.tabId, '')
      return { tabId: msg.tabId, isBypassed }
    }

    default:
      throw new Error('Unhandled message type')
  }
}
