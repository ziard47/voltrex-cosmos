import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from './storageService'
import { DEFAULT_SETTINGS } from '@/types/settings'

describe('storageService', () => {
  beforeEach(async () => {
    // Reset to defaults before each test
    await storageService.updateSettings(DEFAULT_SETTINGS)
  })

  it('retrieves default user settings', async () => {
    const settings = await storageService.getSettings()
    expect(settings.protectionEnabled).toBe(true)
    expect(settings.sensitivity).toBe('standard')
    expect(settings.telemetryConsent).toBe(false)
  })

  it('updates partial settings', async () => {
    await storageService.updateSettings({
      sensitivity: 'paranoid',
      protectionEnabled: false,
    })
    const updated = await storageService.getSettings()
    expect(updated.sensitivity).toBe('paranoid')
    expect(updated.protectionEnabled).toBe(false)
  })

  it('manages allowlist additions and avoids duplicates', async () => {
    await storageService.addAllowlistDomain('test-internal.dev')
    let allowlist = await storageService.getAllowlist()
    expect(allowlist).toContain('test-internal.dev')

    // Adding again should not duplicate
    await storageService.addAllowlistDomain('test-internal.dev')
    allowlist = await storageService.getAllowlist()
    const count = allowlist.filter((d) => d === 'test-internal.dev').length
    expect(count).toBe(1)

    // Remove
    await storageService.removeAllowlistDomain('test-internal.dev')
    allowlist = await storageService.getAllowlist()
    expect(allowlist).not.toContain('test-internal.dev')
  })

  it('correctly checks isAllowlisted status', async () => {
    expect(await storageService.isAllowlisted('github.com')).toBe(true)
    expect(await storageService.isAllowlisted('random-threat.xyz')).toBe(false)
  })
})
