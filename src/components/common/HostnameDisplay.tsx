import React, { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { sanitizeHostnameText } from '@/utils/sanitize'
import { isPunycode, hasMixedScripts } from '@/utils/domain'

interface HostnameDisplayProps {
  hostname: string
  punycodeDecoded?: string
  showCopy?: boolean
  className?: string
}

export const HostnameDisplay: React.FC<HostnameDisplayProps> = ({
  hostname,
  punycodeDecoded,
  showCopy = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const safeHost = sanitizeHostnameText(hostname)
  const isPuny = isPunycode(safeHost)
  const isMixed = hasMixedScripts(safeHost)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeHost)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs ${className}`}
    >
      <span className="text-slate-200 truncate select-all" title={safeHost}>
        {safeHost}
      </span>

      {(isPuny || isMixed) && (
        <Tooltip
          title={
            isPuny
              ? `Punycode representation. Decodes to: ${punycodeDecoded || safeHost}`
              : 'Contains mixed script characters (potential homoglyph attack).'
          }
          arrow
        >
          <span className="text-amber-400 flex items-center cursor-help">
            <WarningAmberIcon sx={{ fontSize: 14 }} />
          </span>
        </Tooltip>
      )}

      {showCopy && (
        <Tooltip title={copied ? 'Copied' : 'Copy hostname'} arrow>
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label="Copy hostname to clipboard"
            sx={{
              padding: '2px',
              color: copied ? '#10b981' : '#64748b',
              '&:hover': { color: '#e2e8f0' },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 13 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 13 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}
