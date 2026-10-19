import React from 'react'
import ReactDOM from 'react-dom/client'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { WarningApp } from '@/features/warning/WarningApp'
import '@/theme/globals.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CosmosThemeProvider>
        <WarningApp />
      </CosmosThemeProvider>
    </React.StrictMode>
  )
}
