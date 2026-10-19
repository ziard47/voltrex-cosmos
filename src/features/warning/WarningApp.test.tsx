import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { WarningApp } from './WarningApp'

describe('WarningApp', () => {
  it('renders security warning headline, alert role, and safety actions', async () => {
    render(
      <CosmosThemeProvider>
        <WarningApp />
      </CosmosThemeProvider>
    )

    // Check main alert container
    const alertMain = screen.getByRole('alert')
    expect(alertMain).toBeInTheDocument()
    expect(alertMain).toHaveAttribute('aria-live', 'assertive')

    // Check warning headline
    expect(screen.getByText(/Suspected Impersonation Domain/i)).toBeInTheDocument()

    // Wait for mock threat analysis to load
    await waitFor(() => {
      expect(screen.getByText(/Return to Safety/i)).toBeInTheDocument()
    })
  })
})
