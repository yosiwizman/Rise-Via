import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { LegalPage } from '../../pages/LegalPage'

describe('LegalPage', () => {
  it('should render legal page', () => {
    render(<LegalPage />)
    
    expect(screen.getByRole('heading', { name: /Legal & Compliance/i })).toBeInTheDocument()
  })

  it('should display legal content', () => {
    render(<LegalPage />)
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should show compliance information', () => {
    render(<LegalPage />)
    
    expect(screen.getByText(/Legal & Compliance/i)).toBeInTheDocument()
  })
})
