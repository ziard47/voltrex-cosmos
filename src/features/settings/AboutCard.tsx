import React from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import LaunchIcon from '@mui/icons-material/Launch'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import { ShieldLogo } from '@/components/common/ShieldLogo'

export const AboutCard: React.FC = () => {
  return (
    <section aria-labelledby="about-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
          <h2
            id="about-heading"
            className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
          >
            About Voltrex Cosmos
          </h2>
        </div>
        <Chip
          size="small"
          label="v1.0.0 RELEASE"
          sx={{
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontWeight: 700,
            fontSize: '10px',
          }}
        />
      </div>

      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <ShieldLogo size={42} showText={false} />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                Voltrex Cosmos Phishing Shield
              </h3>
              <p className="text-slate-400 text-xs">
                Privacy-preserving client-side detection for lookalike domains and
                phishing.
              </p>
            </div>
          </div>

          <Button
            variant="outlined"
            size="small"
            startIcon={<GitHubIcon />}
            endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
            href="https://github.com/mohomedziard/voltrex-cosmos"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: '#334155',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              px: 2,
              py: '6px',
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                color: '#22d3ee',
              },
            }}
          >
            GitHub Repository
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Creator & Development
            </span>
            <p className="text-slate-200 font-medium">
              Designed & Developed by{' '}
              <strong className="text-cyan-300">Mohomed Ziard</strong>
            </p>
            <p className="text-[11px] text-slate-400">Voltrex Digital Engineering</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">
              Architecture & Privacy
            </span>
            <p className="text-slate-200 font-medium">
              100% Deterministic Local Evaluation
            </p>
            <p className="text-[11px] text-slate-400">
              Zero browsing history tracking • MIT License
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
