import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { SettingsApp } from './SettingsApp'

describe('SettingsApp', () => {
  it('renders protection controls, sensitivity options, and allowlist', async () => {
    render(
      <CosmosThemeProvider>
        <SettingsApp />
      </CosmosThemeProvider>
    )

    expect(screen.getByText(/Extension Settings & Shield Controls/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Detection Sensitivity/i)).toBeInTheDocument()
      expect(screen.getByText(/Standard Protection/i)).toBeInTheDocument()
      expect(screen.getByText(/Trusted Domain Allowlist/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Privacy & Data Processing Principles/i)
      ).toBeInTheDocument()
    })
  })
})
