import React from 'react'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { HostnameDisplay } from '@/components/common/HostnameDisplay'
import type { DomainAnalysis } from '@/types/domain'

interface ThreatHostCardProps {
  analysis: DomainAnalysis
}

export const ThreatHostCard: React.FC<ThreatHostCardProps> = ({ analysis }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-red-900/50 shadow-threat-glow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-red-400 font-semibold uppercase tracking-wider block">
            Flagged Hostname
          </span>
          <div className="mt-1 flex items-center gap-2">
            <HostnameDisplay
              hostname={analysis.hostname}
              punycodeDecoded={analysis.punycodeDecoded}
              className="text-sm px-3 py-1.5 bg-red-950/30 border-red-800/60 text-red-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {analysis.targetBrand && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <CompareArrowsIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Target Brand Identity
                </span>
                <span className="text-xs font-semibold text-cyan-300">
                  {analysis.targetBrand}
                </span>
              </div>
            </div>
          )}

          <div className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
            {analysis.analysisSource === 'threat_intelligence' ? (
              <span className="text-amber-400 font-semibold">
                Feed: Threat Intelligence
              </span>
            ) : analysis.analysisSource === 'hybrid' ? (
              <span className="text-cyan-400 font-semibold">
                Feed: Local + Threat Feed
              </span>
            ) : (
              <span className="text-cyan-300 font-semibold">
                Analysis: Local Heuristics (Offline)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 space-y-1">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold">
            <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Lookalike Indicators</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{analysis.statusExplanation}</p>
          {analysis.isPunycode && (
            <p className="text-[11px] font-mono text-amber-300/90 pt-1">
              Raw Punycode: {analysis.normalizedHostname}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Target Authentication</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
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
