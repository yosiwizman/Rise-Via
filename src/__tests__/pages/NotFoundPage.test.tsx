import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import { NotFoundPage } from '../../pages/NotFoundPage'

describe('NotFoundPage', () => {
  const mockOnNavigate = vi.fn()

  it('should render 404 error message', () => {
    render(<NotFoundPage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })

  it('should display page not found content', () => {
    render(<NotFoundPage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('should show navigation buttons', () => {
    render(<NotFoundPage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument()
    expect(screen.getByText(/Browse Strains/i)).toBeInTheDocument()
  })

  it('should display helpful error message', () => {
    render(<NotFoundPage onNavigate={mockOnNavigate} />)
    
    expect(screen.getByText(/page you're looking for/i)).toBeInTheDocument()
  })
})
