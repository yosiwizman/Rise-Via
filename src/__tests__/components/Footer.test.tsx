import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test-utils'
import { Footer } from '../../components/Footer'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const mockProps = {
  onNavigate: mockNavigate
}

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render footer content', () => {
    render(<Footer {...mockProps} />)
    
    expect(screen.getByRole('heading', { name: /risevia/i })).toBeInTheDocument()
    expect(screen.getByText(/premium.*thca/i)).toBeInTheDocument()
  })

  it('should render contact information', () => {
    render(<Footer {...mockProps} />)
    
    expect(screen.getByText(/support@risevia.com/i)).toBeInTheDocument()
    expect(screen.getByText(/1-800-RISEVIA/i)).toBeInTheDocument()
  })

  it('should display social media buttons', () => {
    render(<Footer {...mockProps} />)
    
    const socialButtons = screen.getAllByRole('button')
    expect(socialButtons.length).toBeGreaterThan(0)
  })

  it('should show copyright information', () => {
    render(<Footer {...mockProps} />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
  })

  it('should display legal disclaimers', () => {
    render(<Footer {...mockProps} />)
    
    expect(screen.getByText(/wellness.*naturally/i)).toBeInTheDocument()
    expect(screen.getByText(/premium.*thca/i)).toBeInTheDocument()
  })

  it('should display company logo', () => {
    render(<Footer {...mockProps} />)
    
    const logo = screen.getByRole('heading', { name: /risevia/i })
    expect(logo).toBeInTheDocument()
  })
})
