import React from 'react'
import type { RiskLevel } from '@/types/domain'
import { getRiskColorTokens, getRiskLabel } from '@/utils/domain'

interface RiskBadgeProps {
  riskLevel: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
  className?: string
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskLevel,
  size = 'md',
  showPulse = false,
  className = '',
}) => {
  const tokens = getRiskColorTokens(riskLevel)
  const label = getRiskLabel(riskLevel)

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  return (
    <span
      role="status"
      aria-label={`Current security risk level: ${label}`}
      className={`inline-flex items-center font-medium rounded-full border transition-colors select-none ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: tokens.badgeBg,
        borderColor: tokens.badgeBorder,
        color: tokens.textColor,
      }}
    >
      <span
        className={`rounded-full flex-shrink-0 ${dotSizes[size]} ${
          showPulse && riskLevel === 'malicious'
            ? 'animate-pulse motion-reduce:animate-none'
            : ''
        }`}
        style={{ backgroundColor: tokens.indicatorDot }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  )
}
