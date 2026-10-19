import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskBadge } from './RiskBadge'

describe('RiskBadge', () => {
  it('renders Malicious status with accessible role and label', () => {
    render(<RiskBadge riskLevel="malicious" />)
    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute(
      'aria-label',
      'Current security risk level: High Threat'
    )
    expect(badge).toHaveTextContent('High Threat')
  })

  it('renders Suspicious status', () => {
    render(<RiskBadge riskLevel="suspicious" />)
    expect(screen.getByText('Suspicious')).toBeInTheDocument()
  })

  it('renders Low Risk status', () => {
    render(<RiskBadge riskLevel="low_risk" />)
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
  })

  it('renders Checking status', () => {
    render(<RiskBadge riskLevel="checking" />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('renders Unknown status', () => {
    render(<RiskBadge riskLevel="unknown" />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
