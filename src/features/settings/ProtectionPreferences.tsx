import React from 'react'
import Switch from '@mui/material/Switch'
import type { UserSettings } from '@/types/settings'

interface ProtectionPreferencesProps {
  settings: UserSettings
  onUpdate: (partial: Partial<UserSettings>) => Promise<unknown>
}

export const ProtectionPreferences: React.FC<ProtectionPreferencesProps> = ({
  settings,
  onUpdate,
}) => {
  return (
    <section aria-labelledby="preferences-heading" className="space-y-4">
      <h2
        id="preferences-heading"
        className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
      >
        Protection Features
      </h2>

      <div className="space-y-3">
        {/* Lookalike & Typosquat */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              Lookalike & Typosquatting Protection
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Detect deceptive character substitutions, keyword stacking, and brand name
              impersonation.
            </span>
          </div>
          <Switch
            checked={settings.detectLookalikeBrands}
            onChange={(e) => onUpdate({ detectLookalikeBrands: e.target.checked })}
            slotProps={{ input: { 'aria-label': 'Toggle lookalike brand detection' } }}
          />
        </div>

        {/* Punycode Homoglyph */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              Punycode & Homoglyph Spoof Detection
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Examine Internationalized Domain Names (IDNs) for mixed alphabets mimicking
              Latin letters.
            </span>
          </div>
          <Switch
            checked={settings.detectPunycodeSpoofs}
            onChange={(e) => onUpdate({ detectPunycodeSpoofs: e.target.checked })}
            slotProps={{
              input: { 'aria-label': 'Toggle punycode homoglyph spoof detection' },
            }}
          />
        </div>

        {/* Suspicious TLDs */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              Suspicious TLD & Entropy Warnings
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Flag elevated-risk top level domains and abnormally randomized domain
              strings.
            </span>
          </div>
          <Switch
            checked={settings.checkSuspiciousTlds}
            onChange={(e) => onUpdate({ checkSuspiciousTlds: e.target.checked })}
            slotProps={{ input: { 'aria-label': 'Toggle suspicious TLD alerts' } }}
          />
        </div>

        {/* Automatic Interception */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              Automatic Malicious Site Warning Interception
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Automatically display full warning screen when high-confidence malicious
              domains are encountered.
            </span>
          </div>
          <Switch
            checked={settings.blockMaliciousAutomatically}
            onChange={(e) => onUpdate({ blockMaliciousAutomatically: e.target.checked })}
            slotProps={{
              input: { 'aria-label': 'Toggle automatic malicious site warning' },
            }}
          />
        </div>

        {/* Warn on Suspicious */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              Warn on Suspicious Lookalikes
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Display warning screen for suspicious lookalikes (moderate confidence) in
              addition to confirmed threats.
            </span>
          </div>
          <Switch
            checked={settings.warnOnSuspicious}
            onChange={(e) => onUpdate({ warnOnSuspicious: e.target.checked })}
            slotProps={{
              input: { 'aria-label': 'Toggle warning on suspicious lookalikes' },
            }}
          />
        </div>

        {/* Optional Threat Intelligence */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-100 block">
              External Threat Intelligence Lookups (Optional)
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Query configured external reputation feeds. When disabled (default), all
              evaluations run 100% locally on-device for total privacy.
            </span>
          </div>
          <Switch
            checked={settings.threatIntelEnabled}
            onChange={(e) => onUpdate({ threatIntelEnabled: e.target.checked })}
            slotProps={{
              input: { 'aria-label': 'Toggle external threat intelligence lookups' },
            }}
          />
        </div>
      </div>
    </section>
  )
}
