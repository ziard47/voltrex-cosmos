import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CosmosThemeProvider } from '@/theme/ThemeProvider'
import { PopupApp } from './PopupApp'

describe('PopupApp', () => {
  it('renders branding, active site section, and footer credits', async () => {
    render(
      <CosmosThemeProvider>
        <PopupApp />
      </CosmosThemeProvider>
    )

    // Check branding
    expect(screen.getAllByText(/Voltrex/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Cosmos/i).length).toBeGreaterThan(0)

    // Check headings
    expect(screen.getByText(/Active Site Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/Recent Lookalikes/i)).toBeInTheDocument()

    // Check footer credits
    await waitFor(() => {
      expect(
        screen.getByText(/Designed and Developed by Mohomed Ziard/i)
      ).toBeInTheDocument()
    })
  })
})
