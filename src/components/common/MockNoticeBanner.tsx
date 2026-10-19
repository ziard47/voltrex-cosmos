import React from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

interface MockNoticeBannerProps {
  className?: string
  compact?: boolean
}

export const MockNoticeBanner: React.FC<MockNoticeBannerProps> = ({
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-400 ${className}`}
        role="note"
      >
        <InfoOutlinedIcon sx={{ fontSize: 13, color: '#38bdf8' }} />
        <span>
          <strong className="text-slate-300">Security Shield:</strong> Client-side threat
          detection is active.
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 ${className}`}
      role="note"
    >
      <InfoOutlinedIcon sx={{ fontSize: 16, color: '#22d3ee', mt: 0.2 }} />
      <div className="flex-1 space-y-0.5">
        <p className="font-semibold text-cyan-300">Client-Side Threat Protection</p>
        <p className="text-slate-400 leading-relaxed">
          Voltrex Cosmos deterministically evaluates domain lookalikes, UTS #39
          confusables, and brand impersonation without recording your browsing history.
        </p>
      </div>
    </div>
  )
}
