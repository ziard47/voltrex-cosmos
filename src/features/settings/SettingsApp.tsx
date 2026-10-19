import React, { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { ShieldLogo } from '@/components/common/ShieldLogo'
import { MockNoticeBanner } from '@/components/common/MockNoticeBanner'
import { ProtectionPreferences } from './ProtectionPreferences'
import { SensitivitySelector } from './SensitivitySelector'
import { AllowlistManager } from './AllowlistManager'
import { ThreatIntelligenceCard } from './ThreatIntelligenceCard'
import { PrivacyPolicyCard } from './PrivacyPolicyCard'
import { useSettings } from '@/hooks/useSettings'
import type { SensitivityLevel } from '@/types/settings'

export const SettingsApp: React.FC = () => {
  const {
    settings,
    loading,
    error,
    updateSettings,
    addAllowlistDomain,
    removeAllowlistDomain,
  } = useSettings()

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSensitivityChange = async (level: SensitivityLevel) => {
    await updateSettings({ sensitivity: level })
    setToastMessage(`Detection sensitivity set to ${level.toUpperCase()}`)
  }

  const handleUpdate = async (partial: Parameters<typeof updateSettings>[0]) => {
    await updateSettings(partial)
    setToastMessage('Preferences saved successfully')
  }

  return (
    <main className="min-h-screen bg-cosmos-bg text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <ShieldLogo size={40} />
          <div className="text-right">
            <h1 className="text-lg font-bold text-slate-100 font-sans">
              Extension Settings & Shield Controls
            </h1>
            <p className="text-xs text-slate-400">
              Configure lookalike detection, allowlist rules, and privacy controls.
            </p>
          </div>
        </div>

        <MockNoticeBanner />

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <CircularProgress sx={{ color: '#06b6d4' }} />
            <p className="text-xs text-slate-400">
              Loading user settings from storage...
            </p>
          </div>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
          >
            {error}
          </Alert>
        ) : settings ? (
          <div className="space-y-8">
            <ProtectionPreferences settings={settings} onUpdate={handleUpdate} />

            <SensitivitySelector
              currentLevel={settings.sensitivity}
              onChange={handleSensitivityChange}
            />

            <AllowlistManager
              allowlist={settings.allowlist}
              onAddDomain={async (d) => {
                await addAllowlistDomain(d)
                setToastMessage(`"${d}" added to trusted allowlist`)
              }}
              onRemoveDomain={async (d) => {
                await removeAllowlistDomain(d)
                setToastMessage(`"${d}" removed from allowlist`)
              }}
            />

            <ThreatIntelligenceCard
              status={settings.threatFeedStatus}
              lastUpdated={settings.threatFeedLastUpdated}
            />

            <PrivacyPolicyCard />
          </div>
        ) : null}

        <footer className="text-center text-xs text-slate-500 pt-8 border-t border-slate-900">
          Voltrex Cosmos — Phase 1 Project Foundation
        </footer>
      </div>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </main>
  )
}
