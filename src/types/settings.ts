export type SensitivityLevel = 'standard' | 'high' | 'paranoid'

export type ThreatFeedStatus = 'local_mock' | 'syncing' | 'synced' | 'offline'

export interface UserSettings {
  protectionEnabled: boolean
  sensitivity: SensitivityLevel
  blockMaliciousAutomatically: boolean
  warnOnSuspicious: boolean
  detectPunycodeSpoofs: boolean
  detectLookalikeBrands: boolean
  checkSuspiciousTlds: boolean
  allowlist: string[]
  threatFeedStatus: ThreatFeedStatus
  threatFeedLastUpdated: string
  threatIntelEnabled: boolean // Default false for strict privacy & offline operation
  telemetryConsent: boolean // Default false for strict privacy
}

export const DEFAULT_SETTINGS: UserSettings = {
  protectionEnabled: true,
  sensitivity: 'standard',
  blockMaliciousAutomatically: true,
  warnOnSuspicious: true,
  detectPunycodeSpoofs: true,
  detectLookalikeBrands: true,
  checkSuspiciousTlds: true,
  allowlist: ['accounts.google.com', 'github.com', 'paypal.com'],
  threatFeedStatus: 'local_mock',
  threatFeedLastUpdated: '2026-10-19T00:00:00Z',
  threatIntelEnabled: false,
  telemetryConsent: false,
}
