import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { ContactPage } from '../../pages/ContactPage'

describe('ContactPage', () => {
  it('should render contact page', () => {
    render(<ContactPage />)
    
    expect(screen.getByText(/Contact RiseViA/i)).toBeInTheDocument()
  })

  it('should display contact form', () => {
    render(<ContactPage />)
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
  })

  it('should display contact information', () => {
    render(<ContactPage />)
    
    expect(screen.getByText(/support@risevia.com/i)).toBeInTheDocument()
    expect(screen.getByText(/1-800-RISEVIA/i)).toBeInTheDocument()
  })

  it('should display business hours', () => {
    render(<ContactPage />)
    
    expect(screen.getByText(/Customer Support/i)).toBeInTheDocument()
    expect(screen.getByText(/Monday - Friday: 9:00 AM - 6:00 PM EST/i)).toBeInTheDocument()
  })

  it('should show send message button', () => {
    render(<ContactPage />)
    
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument()
  })
})
