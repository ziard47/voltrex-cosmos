import React, { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { EmptyState } from '@/components/common/EmptyState'
import { isValidDomain, normalizeHostname } from '@/utils/domain'

interface AllowlistManagerProps {
  allowlist: string[]
  onAddDomain: (domain: string) => Promise<unknown>
  onRemoveDomain: (domain: string) => Promise<unknown>
}

export const AllowlistManager: React.FC<AllowlistManagerProps> = ({
  allowlist,
  onAddDomain,
  onRemoveDomain,
}) => {
  const [newDomain, setNewDomain] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = normalizeHostname(newDomain)

    if (!normalized) {
      setInputError('Please enter a valid hostname or domain.')
      return
    }

    if (!isValidDomain(normalized)) {
      setInputError(
        'Format is invalid. Example: "corp.mycompany.internal" or "mybank.com".'
      )
      return
    }

    if (allowlist.includes(normalized)) {
      setInputError('Domain is already present in your allowlist.')
      return
    }

    try {
      setIsSubmitting(true)
      await onAddDomain(normalized)
      setNewDomain('')
      setInputError(null)
    } catch {
      setInputError('Failed to save domain.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="allowlist-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VerifiedUserIcon sx={{ fontSize: 18, color: '#10b981' }} />
          <h2
            id="allowlist-heading"
            className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300"
          >
            Trusted Domain Allowlist ({allowlist.length})
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Domains here bypass all lookalike warnings.
        </span>
      </div>

      {/* Add Domain Input Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5">
        <TextField
          size="small"
          placeholder="e.g. portal.company.com"
          value={newDomain}
          onChange={(e) => {
            setNewDomain(e.target.value)
            if (inputError) setInputError(null)
          }}
          error={Boolean(inputError)}
          helperText={inputError}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#090d16',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'monospace',
              '& fieldset': { borderColor: '#1e293b' },
              '&:hover fieldset': { borderColor: '#334155' },
              '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
            },
          }}
          slotProps={{
            htmlInput: {
              'aria-label': 'Enter domain to add to trusted allowlist',
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !newDomain.trim()}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#06b6d4',
            color: '#080c16',
            fontWeight: 600,
            fontSize: '13px',
            whiteSpace: 'nowrap',
            height: '40px',
            px: 2.5,
            '&:hover': { backgroundColor: '#22d3ee' },
          }}
        >
          Add Domain
        </Button>
      </form>

      {/* Allowlist Items */}
      {allowlist.length === 0 ? (
        <EmptyState
          title="No domains in allowlist"
          description="Add domains you explicitly trust (such as local corporate intranets or staging subdomains)."
        />
      ) : (
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
          {allowlist.map((domain) => (
            <div
              key={domain}
              className="px-4 py-2.5 flex items-center justify-between text-xs font-mono hover:bg-slate-800/40 transition-colors"
            >
              <span className="text-slate-200 select-all">{domain}</span>
              <Tooltip title="Remove from allowlist" arrow>
                <IconButton
                  size="small"
                  onClick={() => onRemoveDomain(domain)}
                  aria-label={`Remove ${domain} from allowlist`}
                  sx={{
                    color: '#64748b',
                    '&:hover': { color: '#ef4444' },
                    p: '4px',
                  }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
