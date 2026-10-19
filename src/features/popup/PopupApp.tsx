import React, { useState, useEffect } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import TuneIcon from '@mui/icons-material/Tune'
import Button from '@mui/material/Button'
import { PopupHeader } from './PopupHeader'
import { CurrentDomainCard } from './CurrentDomainCard'
import { RecentDetectionsList } from './RecentDetectionsList'
import { useSettings } from '@/hooks/useSettings'
import { useActiveTab } from '@/hooks/useActiveTab'
import { useDomainSecurity } from '@/hooks/useDomainSecurity'
import { storageService } from '@/services/storageService'
import { tabService } from '@/services/tabService'
import type { RecentDetection } from '@/types/domain'

export const PopupApp: React.FC = () => {
  const { settings, toggleProtection, loading: settingsLoading } = useSettings()
  const { tab, loading: tabLoading } = useActiveTab()
  const { analysis, loading: securityLoading } = useDomainSecurity(tab?.hostname ?? null)

  const [recentDetections, setRecentDetections] = useState<RecentDetection[]>([])
  const [detectionsLoading, setDetectionsLoading] = useState(true)

  useEffect(() => {
    storageService.getRecentDetections().then((items) => {
      setRecentDetections(items)
      setDetectionsLoading(false)
    })
  }, [])

  const handleClearRecent = async () => {
    await storageService.clearRecentDetections()
    setRecentDetections([])
  }

  const handleOpenSettings = () => {
    tabService.openSettingsPage()
  }

  const handlePreviewWarning = () => {
    tabService.openWarningPage(tab?.hostname || 'pаypal.com')
  }

  const protectionEnabled = settings?.protectionEnabled ?? true

  return (
    <div className="w-[370px] min-h-[480px] bg-cosmos-bg text-slate-100 p-4 flex flex-col justify-between font-sans select-none antialiased border border-slate-700/80">
      <div className="space-y-3.5">
        <PopupHeader
          protectionEnabled={protectionEnabled}
          onToggleProtection={toggleProtection}
          disabled={settingsLoading}
        />

        <CurrentDomainCard
          hostname={tab?.hostname ?? ''}
          analysis={analysis}
          loading={tabLoading || securityLoading}
          protectionEnabled={protectionEnabled}
          isRestrictedTab={tab?.isRestricted}
        />

        <RecentDetectionsList
          detections={recentDetections}
          onClear={handleClearRecent}
          loading={detectionsLoading}
        />
      </div>

      <div className="pt-3 mt-3 border-t border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Button
            size="small"
            startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
            onClick={handleOpenSettings}
            sx={{
              color: '#94a3b8',
              fontSize: '11px',
              '&:hover': { color: '#22d3ee' },
              p: '2px 6px',
            }}
          >
            Preferences & Allowlist
          </Button>

          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            onClick={handlePreviewWarning}
            sx={{
              color: '#64748b',
              fontSize: '11px',
              '&:hover': { color: '#f87171' },
              p: '2px 6px',
            }}
          >
            Warning Page Demo
          </Button>
        </div>

        <footer className="text-[10px] text-center text-slate-500 pt-2 border-t border-slate-800/80 leading-normal">
          Voltrex Cosmos Designed and Developed by Mohomed Ziard | Voltrex Digital
        </footer>
      </div>
    </div>
  )
}
