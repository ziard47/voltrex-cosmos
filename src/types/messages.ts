import type { UserSettings } from './settings'

/**
 * Voltrex Cosmos — Extension Message Contracts
 *
 * Defines strictly typed communication between Popup, Warning Page,
 * Settings Page, and Background Service Worker.
 */

export interface AnalyzeUrlMessage {
  type: 'ANALYZE_URL'
  url: string
  tabId?: number
}

export interface GetNavigationStateMessage {
  type: 'GET_NAVIGATION_STATE'
  tabId: number
}

export interface BypassWarningMessage {
  type: 'BYPASS_WARNING'
  hostname: string
  tabId?: number
}

export interface AddAllowlistMessage {
  type: 'ADD_ALLOWLIST'
  domain: string
}

export interface RemoveAllowlistMessage {
  type: 'REMOVE_ALLOWLIST'
  domain: string
}

export interface OpenSettingsMessage {
  type: 'OPEN_SETTINGS'
}

export interface OpenWarningMessage {
  type: 'OPEN_WARNING'
  hostname: string
}

export interface ClearRecentDetectionsMessage {
  type: 'CLEAR_RECENT_DETECTIONS'
}

export interface GetSettingsMessage {
  type: 'GET_SETTINGS'
}

export interface UpdateSettingsMessage {
  type: 'UPDATE_SETTINGS'
  settings: Partial<UserSettings>
}

export type ExtensionMessage =
  | AnalyzeUrlMessage
  | GetNavigationStateMessage
  | BypassWarningMessage
  | AddAllowlistMessage
  | RemoveAllowlistMessage
  | OpenSettingsMessage
  | OpenWarningMessage
  | ClearRecentDetectionsMessage
  | GetSettingsMessage
  | UpdateSettingsMessage

export interface ExtensionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Validates untrusted incoming runtime message objects against known contract shapes.
 */
export function isValidExtensionMessage(message: unknown): message is ExtensionMessage {
  if (typeof message !== 'object' || message === null) {
    return false
  }

  const msg = message as Record<string, unknown>
  if (typeof msg.type !== 'string') {
    return false
  }

  switch (msg.type) {
    case 'ANALYZE_URL':
      return typeof msg.url === 'string' && msg.url.length <= 4096
    case 'GET_NAVIGATION_STATE':
      return typeof msg.tabId === 'number'
    case 'BYPASS_WARNING':
      return typeof msg.hostname === 'string' && msg.hostname.length <= 255
    case 'ADD_ALLOWLIST':
    case 'REMOVE_ALLOWLIST':
      return typeof msg.domain === 'string' && msg.domain.length <= 255
    case 'OPEN_WARNING':
      return typeof msg.hostname === 'string' && msg.hostname.length <= 255
    case 'OPEN_SETTINGS':
    case 'CLEAR_RECENT_DETECTIONS':
    case 'GET_SETTINGS':
      return true
    case 'UPDATE_SETTINGS':
      return typeof msg.settings === 'object' && msg.settings !== null
    default:
      return false
  }
}
