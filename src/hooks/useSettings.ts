import { useState, useEffect, useCallback } from 'react'
import type { UserSettings } from '@/types/settings'
import { storageService } from '@/services/storageService'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await storageService.getSettings()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const update = useCallback(async (partial: Partial<UserSettings>) => {
    try {
      const updated = await storageService.updateSettings(partial)
      setSettings(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    }
  }, [])

  const toggleProtection = useCallback(async () => {
    if (!settings) return
    return update({ protectionEnabled: !settings.protectionEnabled })
  }, [settings, update])

  const addAllowlistDomain = useCallback(async (domain: string) => {
    const updatedList = await storageService.addAllowlistDomain(domain)
    setSettings((prev) => (prev ? { ...prev, allowlist: updatedList } : null))
    return updatedList
  }, [])

  const removeAllowlistDomain = useCallback(async (domain: string) => {
    const updatedList = await storageService.removeAllowlistDomain(domain)
    setSettings((prev) => (prev ? { ...prev, allowlist: updatedList } : null))
    return updatedList
  }, [])

  return {
    settings,
    loading,
    error,
    refresh: loadSettings,
    updateSettings: update,
    toggleProtection,
    addAllowlistDomain,
    removeAllowlistDomain,
  }
}
