export const cosmosTokens = {
  colors: {
    bgDark: '#080c16',
    surface: '#0f172a',
    card: '#131f37',
    cardHover: '#182745',
    cardBorder: '#1e293b',
    borderSubtle: '#26354a',

    // Accents
    indigo: '#6366f1',
    indigoDeep: '#4338ca',
    cyan: '#06b6d4',
    cyanBright: '#22d3ee',
    cyanGlow: 'rgba(6, 182, 212, 0.18)',
    violet: '#8b5cf6',

    // Security Statuses
    threatRed: '#ef4444',
    threatRedLight: '#f87171',
    threatRedGlow: 'rgba(239, 68, 68, 0.25)',
    warningAmber: '#f59e0b',
    warningAmberLight: '#fbbf24',
    warningAmberGlow: 'rgba(245, 158, 11, 0.22)',
    safeGreen: '#10b981',
    safeGreenLight: '#34d399',
    safeGreenGlow: 'rgba(16, 185, 129, 0.2)',

    // Text hierarchy (accessible contrast on dark surfaces)
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    glowCyan: '0 0 20px -3px rgba(6, 182, 212, 0.25)',
    glowRed: '0 0 24px -2px rgba(239, 68, 68, 0.35)',
    glowAmber: '0 0 24px -2px rgba(245, 158, 11, 0.3)',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '9999px',
  },
} as const
