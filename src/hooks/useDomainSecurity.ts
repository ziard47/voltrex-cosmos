import { useState, useEffect, useCallback } from 'react'
import type { DomainAnalysis } from '@/types/domain'
import { detectionService } from '@/services/detectionService'

export function useDomainSecurity(rawInput: string | null) {
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async (target: string) => {
    if (!target) {
      setAnalysis(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await detectionService.analyzeDomain(target)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (rawInput) {
      check(rawInput)
    }
  }, [rawInput, check])

  return {
    analysis,
    loading,
    error,
    recheck: () => rawInput && check(rawInput),
  }
}
