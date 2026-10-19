import React from 'react'
import HistoryIcon from '@mui/icons-material/History'
import ShieldAlertIcon from '@mui/icons-material/ReportProblemOutlined'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { RiskBadge } from '@/components/common/RiskBadge'
import { EmptyState } from '@/components/common/EmptyState'
import type { RecentDetection } from '@/types/domain'
import { formatRelativeTime } from '@/utils/domain'
import { tabService } from '@/services/tabService'

interface RecentDetectionsListProps {
  detections: RecentDetection[]
  onClear?: () => void
  loading?: boolean
}

export const RecentDetectionsList: React.FC<RecentDetectionsListProps> = ({
  detections,
  onClear,
  loading = false,
}) => {
  const handleItemClick = (hostname: string) => {
    tabService.openWarningPage(hostname)
  }

  return (
    <section aria-labelledby="recent-detections-heading" className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HistoryIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
          <h2
            id="recent-detections-heading"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono"
          >
            Recent Lookalikes
          </h2>
        </div>

        {detections.length > 0 && onClear && (
          <Tooltip title="Clear recent detection history" arrow>
            <IconButton
              size="small"
              onClick={onClear}
              aria-label="Clear recent detection history"
              sx={{ color: '#64748b', '&:hover': { color: '#ef4444' }, p: '2px' }}
            >
              <DeleteSweepOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-slate-500">
          Loading detections...
        </div>
      ) : detections.length === 0 ? (
        <EmptyState
          title="No recent lookalike detections"
          description="Flagged suspicious domains will appear here for review."
          className="py-4"
        />
      ) : (
        <ul className="space-y-1.5 list-none p-0 m-0" role="list">
          {detections.slice(0, 4).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleItemClick(item.hostname)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-800/70 hover:bg-slate-800/50 transition-all flex items-center justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={`View security report for ${item.hostname}`}
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <ShieldAlertIcon
                    sx={{
                      fontSize: 16,
                      color: item.riskLevel === 'malicious' ? '#f87171' : '#fbbf24',
                    }}
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-mono font-medium text-slate-200 truncate group-hover:text-cyan-300">
                      {item.hostname}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.matchedTarget ? `Spoofing ${item.matchedTarget} • ` : ''}
                      {formatRelativeTime(item.detectedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.indicatorCount} {item.indicatorCount === 1 ? 'flag' : 'flags'}
                  </span>
                  <RiskBadge riskLevel={item.riskLevel} size="sm" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
