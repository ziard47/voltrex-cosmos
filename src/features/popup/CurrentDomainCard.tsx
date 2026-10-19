import React from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { RiskBadge } from '@/components/common/RiskBadge'
import { HostnameDisplay } from '@/components/common/HostnameDisplay'
import type { DomainAnalysis } from '@/types/domain'
import { tabService } from '@/services/tabService'

interface CurrentDomainCardProps {
  hostname: string
  analysis: DomainAnalysis | null
  loading: boolean
  protectionEnabled: boolean
  isRestrictedTab?: boolean
}

export const CurrentDomainCard: React.FC<CurrentDomainCardProps> = ({
  hostname,
  analysis,
  loading,
  protectionEnabled,
  isRestrictedTab = false,
}) => {
  const riskLevel = loading
    ? 'checking'
    : !protectionEnabled
      ? 'unknown'
      : (analysis?.riskLevel ?? 'unknown')

  const handleOpenWarning = () => {
    tabService.openWarningPage(hostname || 'pаypal.com')
  }

  return (
    <section
      aria-labelledby="active-domain-heading"
      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span
          id="active-domain-heading"
          className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono"
        >
          Active Site Analysis
        </span>
        <RiskBadge riskLevel={riskLevel} size="sm" showPulse />
      </div>

      <div className="flex items-center justify-between gap-2">
        <HostnameDisplay
          hostname={hostname || 'No active tab'}
          punycodeDecoded={analysis?.punycodeDecoded}
        />

        {loading && (
          <CircularProgress size={16} sx={{ color: '#06b6d4' }} thickness={5} />
        )}
      </div>

      {/* Explanation Box */}
      <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-700/70 leading-relaxed">
        {isRestrictedTab ? (
          <p className="text-slate-400">
            Internal browser page. Lookalike and phishing checks are paused on system
            URIs.
          </p>
        ) : !protectionEnabled ? (
          <p className="text-amber-400/90 flex items-center gap-1.5">
            <WarningAmberIcon sx={{ fontSize: 15 }} />
            Protection is currently paused. Sites are not being inspected.
          </p>
        ) : loading ? (
          <p className="text-slate-400">
            Inspecting host structure and security indicators...
          </p>
        ) : analysis ? (
          <div className="space-y-1">
            <p>{analysis.statusExplanation}</p>
            {analysis.riskLevel === 'low_risk' && (
              <p className="text-[11px] text-slate-400 italic">
                * Note: Lack of flagged indicators does not guarantee site authenticity.
                Always check credentials.
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Awaiting domain input...</p>
        )}
      </div>

      {/* Action when suspicious or malicious */}
      {(riskLevel === 'suspicious' || riskLevel === 'malicious') && (
        <div className="pt-1">
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="small"
            onClick={handleOpenWarning}
            startIcon={<ShieldOutlinedIcon sx={{ fontSize: 16 }} />}
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
              fontWeight: 600,
              fontSize: '12px',
              py: '6px',
            }}
          >
            Review Security Warning Details
          </Button>
        </div>
      )}
    </section>
  )
}
