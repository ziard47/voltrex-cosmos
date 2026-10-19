import React, { type ReactNode } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { cosmosMuiTheme } from './muiTheme'

interface CosmosThemeProviderProps {
  children: ReactNode
}

export const CosmosThemeProvider: React.FC<CosmosThemeProviderProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={cosmosMuiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}
