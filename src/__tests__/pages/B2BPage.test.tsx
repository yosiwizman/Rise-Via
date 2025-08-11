import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { B2BPage } from '../../pages/B2BPage'

describe('B2BPage', () => {
  it('should render B2B page content', () => {
    render(<B2BPage />)
    
    expect(screen.getByText(/B2B Wholesale Program/i)).toBeInTheDocument()
  })

  it('should display wholesale benefits', () => {
    render(<B2BPage />)
    
    expect(screen.getAllByText(/Wholesale Pricing/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Business Benefits/i)[0]).toBeInTheDocument()
  })

  it('should show requirements', () => {
    render(<B2BPage />)
    
    expect(screen.getByText(/Requirements/i)).toBeInTheDocument()
    expect(screen.getByText(/Valid business license/i)).toBeInTheDocument()
  })

  it('should have application form', () => {
    render(<B2BPage />)
    
    expect(screen.getByText(/B2B Registration Application/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Business Email/i)).toBeInTheDocument()
  })
})
