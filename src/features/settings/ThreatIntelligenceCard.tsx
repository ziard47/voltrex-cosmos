import React from 'react'
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import Chip from '@mui/material/Chip'
import type { ThreatFeedStatus } from '@/types/settings'
import { CATALOG_VERSION, OFFICIAL_BRANDS } from '@/engine/brands/officialCatalog'

interface ThreatIntelligenceCardProps {
  status: ThreatFeedStatus
  lastUpdated: string
}

export const ThreatIntelligenceCard: React.FC<ThreatIntelligenceCardProps> = ({
  status: _status,
  lastUpdated,
}) => {
  return (
    <section aria-labelledby="threat-intel-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StorageOutlinedIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
          <h2
            id="threat-intel-heading"
            className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
          >
            Threat Intelligence & Architecture
          </h2>
        </div>
        <Chip
          size="small"
          label="LOCAL FIRST"
          sx={{
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontWeight: 700,
            fontSize: '10px',
          }}
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-slate-400 block">Active Provider</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              Local Deterministic Engine (Offline / Zero-Telemetry)
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Catalog Version</span>
            <span className="font-mono text-slate-300 mt-0.5 block">
              v{CATALOG_VERSION} ({OFFICIAL_BRANDS.length} Major Authorities • Updated{' '}
              {new Date(lastUpdated).toLocaleDateString()})
            </span>
          </div>
        </div>

        <div className="text-slate-400 leading-relaxed flex items-start gap-2.5">
          <CloudSyncOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8', mt: 0.2 }} />
          <div className="space-y-1.5">
            <p>
              Domain analysis is performed locally on-device using WHATWG parsing, Public
              Suffix List boundaries, UTS #39 Unicode confusables, and Damerau-Levenshtein
              matrix algorithms. Full browsing history and URL query strings are never
              transmitted.
            </p>
            <p className="text-slate-500 text-[11px]">
              🔒 Security Architecture Notice: Extension packages must never bundle secret
              threat-intelligence API keys. Production reputation integrations require a
              privacy-preserving backend proxy that queries external APIs on the user’s
              behalf without storing browsed hosts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
