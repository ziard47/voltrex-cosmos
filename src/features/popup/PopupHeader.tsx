import React from 'react'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'
import { ShieldLogo } from '@/components/common/ShieldLogo'
import { tabService } from '@/services/tabService'

interface PopupHeaderProps {
  protectionEnabled: boolean
  onToggleProtection: () => void
  disabled?: boolean
}

export const PopupHeader: React.FC<PopupHeaderProps> = ({
  protectionEnabled,
  onToggleProtection,
  disabled = false,
}) => {
  const handleOpenSettings = () => {
    tabService.openSettingsPage()
  }

  return (
    <header className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
      <ShieldLogo size={34} />

      <div className="flex items-center gap-2">
        <Tooltip
          title={
            protectionEnabled
              ? 'Voltrex Cosmos protection is active'
              : 'Protection is paused. Click to enable'
          }
          arrow
        >
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                protectionEnabled ? 'bg-cyan-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-300">
              {protectionEnabled ? 'Active' : 'Paused'}
            </span>
            <Switch
              size="small"
              checked={protectionEnabled}
              onChange={onToggleProtection}
              disabled={disabled}
              slotProps={{
                input: { 'aria-label': 'Toggle Voltrex Cosmos real-time protection' },
              }}
            />
          </div>
        </Tooltip>

        <Tooltip title="Extension settings & allowlist" arrow>
          <IconButton
            size="small"
            onClick={handleOpenSettings}
            aria-label="Open extension settings"
            sx={{
              color: '#94a3b8',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #1e293b',
              '&:hover': {
                color: '#22d3ee',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                borderColor: '#334155',
              },
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  )
}
