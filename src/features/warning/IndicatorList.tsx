import React from 'react'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Chip from '@mui/material/Chip'
import type { SecurityIndicator } from '@/types/domain'

interface IndicatorListProps {
  indicators: SecurityIndicator[]
}

export const IndicatorList: React.FC<IndicatorListProps> = ({ indicators }) => {
  if (indicators.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        No specific technical indicators were flagged.
      </div>
    )
  }

  const getSeverityChip = (severity: SecurityIndicator['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <Chip
            size="small"
            label={severity.toUpperCase()}
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              fontSize: '10px',
              fontWeight: 700,
              height: 20,
            }}
          />
        )
      case 'medium':
        return (
          <Chip
            size="small"
            label="MEDIUM"
            sx={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontSize: '10px',
              fontWeight: 700,
              height: 20,
            }}
          />
        )
      default:
        return (
          <Chip
            size="small"
            label="INFO"
            sx={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '10px',
              fontWeight: 700,
              height: 20,
            }}
          />
        )
    }
  }

  const getCategoryIcon = (severity: SecurityIndicator['severity']) => {
    if (severity === 'critical' || severity === 'high') {
      return <ErrorOutlineOutlinedIcon sx={{ fontSize: 18, color: '#f87171' }} />
    }
    if (severity === 'medium') {
      return <WarningIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
    }
    return <InfoOutlinedIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
  }

  return (
    <section aria-labelledby="indicators-heading" className="space-y-3">
      <h2
        id="indicators-heading"
        className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
      >
        Detected Lookalike Indicators ({indicators.length})
      </h2>

      <div className="space-y-2.5">
        {indicators.map((ind) => (
          <div
            key={ind.id}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-500/80 transition-colors flex items-start gap-3"
          >
            <div className="mt-0.5">{getCategoryIcon(ind.severity)}</div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-100 font-sans">
                  {ind.title}
                </span>
                {getSeverityChip(ind.severity)}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {ind.description}
              </p>

              {ind.detectedValue && (
                <div className="pt-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 inline-block">
                    {ind.detectedValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
