import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { LabResultsPage } from '../../pages/LabResultsPage'

describe('LabResultsPage', () => {
  it('should render lab results page', () => {
    render(<LabResultsPage />)
    
    expect(screen.getByText(/Lab Results/i)).toBeInTheDocument()
  })

  it('should display COA information', () => {
    render(<LabResultsPage />)
    
    expect(screen.getByText(/Certificates of Analysis/i)).toBeInTheDocument()
  })

  it('should show testing information', () => {
    render(<LabResultsPage />)
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should display lab testing content', () => {
    render(<LabResultsPage />)
    
    const content = screen.getByText(/Lab Results/i)
    expect(content).toBeInTheDocument()
  })
})
