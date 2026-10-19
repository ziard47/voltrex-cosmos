import React from 'react'
import ReactDOM from 'react-dom/client'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { SettingsApp } from '@/features/settings/SettingsApp'
import '@/theme/globals.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CosmosThemeProvider>
        <SettingsApp />
      </CosmosThemeProvider>
    </React.StrictMode>
  )
}
