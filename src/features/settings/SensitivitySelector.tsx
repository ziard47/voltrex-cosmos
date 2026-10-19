import React from 'react'
import SpeedIcon from '@mui/icons-material/Speed'
import type { SensitivityLevel } from '@/types/settings'

interface SensitivitySelectorProps {
  currentLevel: SensitivityLevel
  onChange: (level: SensitivityLevel) => void
}

interface SensitivityOption {
  level: SensitivityLevel
  title: string
  badge: string
  description: string
  tradeoff: string
}

const OPTIONS: SensitivityOption[] = [
  {
    level: 'standard',
    title: 'Standard Protection',
    badge: 'Recommended',
    description:
      'Balanced detection focused on verified lookalike patterns, homoglyphs, and known abused TLDs.',
    tradeoff: 'Very low false-positive rate. Suitable for day-to-day browsing.',
  },
  {
    level: 'high',
    title: 'High Sensitivity',
    badge: 'Cautious',
    description:
      'Heightens checks for hyphen-stacked subdomains and newly observed brand-mimicking strings.',
    tradeoff:
      'May occasionally warn on unconventional internal development or test environments.',
  },
  {
    level: 'paranoid',
    title: 'Maximum Vigilance',
    badge: 'Strict',
    description:
      'Flags any domain containing internationalized characters, punycode labels, or high entropy.',
    tradeoff:
      'Frequent alerts on legitimate international web properties. Best for high-security environments.',
  },
]

export const SensitivitySelector: React.FC<SensitivitySelectorProps> = ({
  currentLevel,
  onChange,
}) => {
  return (
    <section aria-labelledby="sensitivity-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <SpeedIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
        <h2
          id="sensitivity-heading"
          className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
        >
          Detection Sensitivity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = currentLevel === opt.level
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => onChange(opt.level)}
              className={`p-4 rounded-xl text-left transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-2 border-cyan-400'
                  : 'bg-slate-900/70 border border-slate-700/80 hover:border-slate-500'
              }`}
              aria-pressed={isSelected}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-cyan-300' : 'text-slate-100'
                    }`}
                  >
                    {opt.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-700/60 text-[11px] text-slate-400 italic">
                {opt.tradeoff}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
