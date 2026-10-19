import { useState, useEffect, useCallback } from 'react'
import { tabService, type ActiveTabInfo } from '@/services/tabService'

export function useActiveTab() {
  const [tab, setTab] = useState<ActiveTabInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTab = useCallback(async () => {
    setLoading(true)
    try {
      const info = await tabService.getActiveTab()
      setTab(info)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTab()
  }, [fetchTab])

  return {
    tab,
    loading,
    refresh: fetchTab,
  }
}
