import React from 'react'
import ReactDOM from 'react-dom/client'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { PopupApp } from '@/features/popup/PopupApp'
import '@/theme/globals.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CosmosThemeProvider>
        <PopupApp />
      </CosmosThemeProvider>
    </React.StrictMode>
  )
}
