import { createTheme } from '@mui/material/styles'
import { cosmosTokens } from './tokens'

export const cosmosMuiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: cosmosTokens.colors.bgDark,
      paper: cosmosTokens.colors.surface,
    },
    primary: {
      main: cosmosTokens.colors.cyan,
      light: cosmosTokens.colors.cyanBright,
      dark: '#0891b2',
      contrastText: '#080c16',
    },
    secondary: {
      main: cosmosTokens.colors.indigo,
      light: '#818cf8',
      dark: cosmosTokens.colors.indigoDeep,
      contrastText: '#ffffff',
    },
    error: {
      main: cosmosTokens.colors.threatRed,
      light: cosmosTokens.colors.threatRedLight,
      dark: '#dc2626',
    },
    warning: {
      main: cosmosTokens.colors.warningAmber,
      light: cosmosTokens.colors.warningAmberLight,
      dark: '#d97706',
    },
    success: {
      main: cosmosTokens.colors.safeGreen,
      light: cosmosTokens.colors.safeGreenLight,
      dark: '#059669',
    },
    info: {
      main: cosmosTokens.colors.cyan,
      light: cosmosTokens.colors.cyanBright,
    },
    text: {
      primary: cosmosTokens.colors.textPrimary,
      secondary: cosmosTokens.colors.textSecondary,
    },
    divider: cosmosTokens.colors.cardBorder,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '6px 16px',
          '&:focus-visible': {
            outline: `2px solid ${cosmosTokens.colors.cyanBright}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          backgroundColor: cosmosTokens.colors.cyan,
          color: '#080c16',
          '&:hover': {
            backgroundColor: cosmosTokens.colors.cyanBright,
            boxShadow: cosmosTokens.shadows.glowCyan,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: cosmosTokens.colors.cyan,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 20,
          height: 20,
        },
        track: {
          borderRadius: 12,
          backgroundColor: '#334155',
          opacity: 1,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: cosmosTokens.colors.card,
          border: `1px solid ${cosmosTokens.colors.cardBorder}`,
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
  },
})
