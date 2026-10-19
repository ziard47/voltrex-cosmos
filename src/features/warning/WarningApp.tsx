import React, { useMemo } from 'react'
import SecurityIcon from '@mui/icons-material/Security'
import CircularProgress from '@mui/material/CircularProgress'
import { ShieldLogo } from '@/components/common/ShieldLogo'
import { MockNoticeBanner } from '@/components/common/MockNoticeBanner'
import { ThreatHostCard } from './ThreatHostCard'
import { IndicatorList } from './IndicatorList'
import { SafetyActions } from './SafetyActions'
import { useDomainSecurity } from '@/hooks/useDomainSecurity'
import { normalizeHostname } from '@/utils/domain'

export const WarningApp: React.FC = () => {
  // Read target hostname safely from URL query parameter ?target=...
  const targetHost = useMemo(() => {
    if (typeof window === 'undefined') return 'pаypal.com'
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('target') || 'pаypal.com'
    const normalized = normalizeHostname(raw)
    // Prevent self-referencing the warning page or extension origin
    if (!normalized || normalized === window.location.hostname) {
      return 'pаypal.com'
    }
    return normalized
  }, [])

  const { analysis, loading, error } = useDomainSecurity(targetHost)

  return (
    <main
      role="alert"
      aria-live="assertive"
      aria-labelledby="warning-main-heading"
      className="min-h-screen bg-cosmos-bg text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <ShieldLogo size={36} />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono font-semibold">
            <SecurityIcon sx={{ fontSize: 16 }} />
            <span>THREAT SHIELD ACTIVE</span>
          </div>
        </div>

        {/* Prominent Warning Headline */}
        <div className="space-y-2">
          <h1
            id="warning-main-heading"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5"
          >
            <span className="text-red-500">⚠</span> Suspected Impersonation Domain
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Voltrex Cosmos flagged this site because its structure, character encoding, or
            domain registration suggests it may be attempting to deceive visitors.
          </p>
        </div>

        {/* Threat Host Card */}
        {loading ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <CircularProgress size={32} sx={{ color: '#ef4444' }} />
            <p className="text-xs text-slate-400">Evaluating domain indicators...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">
            Error analyzing domain: {error}
          </div>
        ) : analysis ? (
          <>
            <ThreatHostCard analysis={analysis} />
            <IndicatorList indicators={analysis.indicators} />
            <SafetyActions
              hostname={analysis.hostname}
              targetBrand={analysis.targetBrand}
              officialUrl={analysis.verifiedOfficialUrl}
            />
          </>
        ) : null}

        {/* Phase 1 Mock Notice */}
        <MockNoticeBanner />
      </div>

      <footer className="text-center text-xs text-slate-500 pt-8 mt-4 border-t border-slate-900">
        Voltrex Cosmos Security • Privacy-Preserving Client-Side Detection
      </footer>
    </main>
  )
}
