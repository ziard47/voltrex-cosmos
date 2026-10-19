import React, { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import type { DomainAnalysis } from '@/types/domain'

interface ThreatHostCardProps {
  analysis: DomainAnalysis
}

export const ThreatHostCard: React.FC<ThreatHostCardProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.hostname)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-red-500/40 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            Flagged Suspicious Domain
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {analysis.targetBrand && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/50 text-xs font-mono text-cyan-300">
              <CompareArrowsIcon sx={{ fontSize: 16 }} />
              <span>
                Target Brand:{' '}
                <strong className="text-white font-semibold">
                  {analysis.targetBrand}
                </strong>
              </span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
            <span>
              {analysis.analysisSource === 'threat_intelligence'
                ? 'Threat Intel Feed'
                : analysis.analysisSource === 'hybrid'
                  ? 'Local + Threat Feed'
                  : 'Local Heuristics Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Flagged Hostname Inspection Box */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Deceptive Destination URL
          </span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-base sm:text-lg font-bold text-red-200 tracking-wide select-all break-all">
              {analysis.hostname}
            </span>
            {analysis.punycodeDecoded &&
              analysis.punycodeDecoded !== analysis.hostname && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/60 text-amber-300 font-mono text-xs">
                  <span>Decodes to:</span>
                  <strong className="text-amber-100 font-semibold underline decoration-amber-400">
                    {analysis.punycodeDecoded}
                  </strong>
                </span>
              )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Tooltip title={copied ? 'Copied to clipboard' : 'Copy flagged hostname'} arrow>
            <IconButton
              size="small"
              onClick={handleCopy}
              aria-label="Copy flagged hostname"
              sx={{
                color: copied ? '#10b981' : '#94a3b8',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid #334155',
                p: '6px',
                '&:hover': {
                  color: '#f8fafc',
                  backgroundColor: 'rgba(51, 65, 85, 0.8)',
                  borderColor: '#64748b',
                },
              }}
            >
              {copied ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Comparison Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 space-y-1.5">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <WarningAmberOutlinedIcon sx={{ fontSize: 17 }} />
            <span>Lookalike Indicators</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            {analysis.statusExplanation}
          </p>
          {analysis.isPunycode && (
            <p className="text-[11px] font-mono text-amber-300/90 pt-1">
              Raw Punycode: {analysis.normalizedHostname}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-700/80 space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <VerifiedUserOutlinedIcon sx={{ fontSize: 17 }} />
            <span>Target Authentication</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-sans">
            {analysis.verifiedOfficialUrl ? (
              <span>
                Official domain pattern:{' '}
                <strong className="text-slate-200 font-mono">
                  {analysis.verifiedOfficialUrl}
                </strong>
                . Phishing sites mimic these visuals to harvest login credentials and 2FA
                tokens.
              </span>
            ) : (
              <span>
                Domain is not registered by recognized brand authorities or verified
                identity registries.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
