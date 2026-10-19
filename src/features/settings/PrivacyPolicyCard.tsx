import React from 'react'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'

export const PrivacyPolicyCard: React.FC = () => {
  return (
    <section aria-labelledby="privacy-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <LockOutlinedIcon sx={{ fontSize: 18, color: '#10b981' }} />
        <h2
          id="privacy-heading"
          className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
        >
          Privacy & Data Processing Principles
        </h2>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3 text-xs">
        <p className="text-slate-300 leading-relaxed font-medium">
          Voltrex Cosmos is engineered with a strict privacy-by-design architecture:
        </p>

        <ul className="space-y-2 text-slate-400 list-none p-0 m-0">
          <li className="flex items-start gap-2">
            <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: '#10b981', mt: 0.2 }} />
            <span>
              <strong className="text-slate-200">100% Client-Side Evaluation:</strong>{' '}
              URLs and domains you visit are examined directly inside your browser. No
              browsing activity is uploaded to remote servers.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: '#10b981', mt: 0.2 }} />
            <span>
              <strong className="text-slate-200">Zero Browsing History Telemetry:</strong>{' '}
              We do not log, track, sell, or profile your web navigation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: '#10b981', mt: 0.2 }} />
            <span>
              <strong className="text-slate-200">Minimal Manifest Permissions:</strong>{' '}
              Voltrex Cosmos requests only{' '}
              <code className="text-cyan-300 bg-slate-950 px-1 rounded">activeTab</code>{' '}
              and <code className="text-cyan-300 bg-slate-950 px-1 rounded">storage</code>{' '}
              permissions, strictly avoiding broad background web interception until
              required.
            </span>
          </li>
        </ul>
      </div>
    </section>
  )
}
