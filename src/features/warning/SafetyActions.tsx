import React, { useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AddModeratorIcon from '@mui/icons-material/AddModerator'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { storageService } from '@/services/storageService'
import { tabService } from '@/services/tabService'
import { normalizeHostname } from '@/utils/domain'

interface SafetyActionsProps {
  hostname: string
  targetBrand?: string
  officialUrl?: string | null
}

export const SafetyActions: React.FC<SafetyActionsProps> = ({
  hostname,
  targetBrand,
  officialUrl,
}) => {
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [showSafeSiteDialog, setShowSafeSiteDialog] = useState(false)
  const [allowlisted, setAllowlisted] = useState(false)

  const validatedOfficialUrl = React.useMemo(() => {
    if (!officialUrl) return null
    try {
      const parsed = new URL(officialUrl)
      if (parsed.protocol === 'https:') {
        return parsed.toString()
      }
      return null
    } catch {
      return null
    }
  }, [officialUrl])

  const handleReturnToSafety = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = 'https://duckduckgo.com'
    }
  }

  const handleProceedAnyway = async () => {
    setShowOverrideDialog(false)
    const cleanHost = normalizeHostname(hostname)
    if (!cleanHost) return

    // Notify background service worker to record session bypass and prevent redirect loops
    await tabService.requestBypass(cleanHost)

    // Strictly validate destination URL structure
    try {
      const targetUrl = new URL(`https://${cleanHost}`)
      if (targetUrl.protocol === 'https:' || targetUrl.protocol === 'http:') {
        window.location.href = targetUrl.toString()
      }
    } catch {
      // Disallow invalid destination
    }
  }

  const handleAddToAllowlist = async () => {
    const cleanHost = normalizeHostname(hostname)
    if (!cleanHost) return
    await storageService.addAllowlistDomain(cleanHost)
    setAllowlisted(true)
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Primary and Safe Search Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="contained"
          size="large"
          onClick={handleReturnToSafety}
          startIcon={<ArrowBackIcon />}
          sx={{
            backgroundColor: '#06b6d4',
            color: '#080c16',
            fontWeight: 700,
            fontSize: '14px',
            py: '10px',
            flex: 1,
            '&:hover': {
              backgroundColor: '#22d3ee',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            },
          }}
        >
          Return to Safety (Recommended)
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => setShowSafeSiteDialog(true)}
          startIcon={<SearchIcon />}
          sx={{
            borderColor: '#334155',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '13px',
            py: '10px',
            '&:hover': {
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
            },
          }}
        >
          {targetBrand ? `Find Official ${targetBrand} Site` : 'Verify Official URL'}
        </Button>
      </div>

      {/* Advanced Secondary Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <button
          type="button"
          onClick={handleAddToAllowlist}
          disabled={allowlisted}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <AddModeratorIcon sx={{ fontSize: 16 }} />
          <span>
            {allowlisted
              ? `Domain "${hostname}" added to allowlist`
              : 'Trust this domain (Add to allowlist)'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowOverrideDialog(true)}
          className="text-slate-500 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Proceed to unsafe site anyway (Not recommended)
        </button>
      </div>

      {/* Safe-Site Lookup Modal */}
      <Dialog
        open={showSafeSiteDialog}
        onClose={() => setShowSafeSiteDialog(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              color: '#f8fafc',
              maxWidth: 480,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '16px' }}>
          Safe Official Site Navigation
        </DialogTitle>
        <DialogContent className="space-y-3 text-sm text-slate-300">
          <p>
            Voltrex Cosmos adheres strictly to our privacy commitment: we never fabricate,
            predict, or guess official URLs without cryptographically verified authority
            registries.
          </p>
          {validatedOfficialUrl ? (
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/60">
              <span className="text-xs uppercase font-mono text-cyan-400 block mb-1">
                Verified Organization Pattern:
              </span>
              <a
                href={validatedOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 font-mono font-semibold hover:underline"
              >
                {validatedOfficialUrl}
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Notice: No official domain mapping is registered for this entity. To visit
              safely, use a reputable search engine or authenticated bookmark.
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowSafeSiteDialog(false)}
            variant="outlined"
            sx={{ borderColor: '#334155', color: '#94a3b8' }}
          >
            Close
          </Button>
          {validatedOfficialUrl && (
            <Button
              href={validatedOfficialUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{ backgroundColor: '#06b6d4', color: '#080c16', fontWeight: 600 }}
            >
              Open Verified Site
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Override Confirmation Modal */}
      <Dialog
        open={showOverrideDialog}
        onClose={() => setShowOverrideDialog(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0f172a',
              border: '1px solid #7f1d1d',
              color: '#f8fafc',
              maxWidth: 480,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningAmberIcon sx={{ color: '#ef4444' }} />
          Confirm Insecure Navigation
        </DialogTitle>
        <DialogContent className="space-y-3 text-sm text-slate-300">
          <p>
            You are about to navigate to{' '}
            <strong className="font-mono text-red-300">{hostname}</strong>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            This domain exhibits high-confidence lookalike or homoglyph indicators.
            Entering passwords, account numbers, or authentication codes on this page
            could compromise your security.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowOverrideDialog(false)}
            variant="contained"
            sx={{ backgroundColor: '#334155', color: '#f8fafc' }}
          >
            Cancel & Stay Safe
          </Button>
          <Button
            onClick={handleProceedAnyway}
            variant="outlined"
            color="error"
            sx={{ borderColor: '#ef4444', color: '#f87171' }}
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
