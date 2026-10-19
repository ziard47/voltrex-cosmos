import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { PopupApp } from './PopupApp'

describe('PopupApp', () => {
  it('renders branding, active site section, and mock notice', async () => {
    render(
      <CosmosThemeProvider>
        <PopupApp />
      </CosmosThemeProvider>
    )

    // Check branding
    expect(screen.getByText(/Voltrex/i)).toBeInTheDocument()
    expect(screen.getByText(/Cosmos/i)).toBeInTheDocument()

    // Check headings
    expect(screen.getByText(/Active Site Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/Recent Lookalikes/i)).toBeInTheDocument()

    // Wait for mock domain check
    await waitFor(() => {
      expect(screen.getByText(/Phase 1 Preview/i)).toBeInTheDocument()
    })
  })
})
