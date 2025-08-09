import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { CareersPage } from '../../pages/CareersPage'

describe('CareersPage', () => {
  it('should render careers page content', () => {
    render(<CareersPage />)
    
    expect(screen.getByText(/Join the RiseViA Team/i)).toBeInTheDocument()
  })

  it('should display team information', () => {
    render(<CareersPage />)
    
    expect(screen.getByText(/passionate individuals/i)).toBeInTheDocument()
    expect(screen.getByText(/growing team/i)).toBeInTheDocument()
  })

  it('should show application form', () => {
    render(<CareersPage />)
    
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
  })

  it('should have submit button', () => {
    render(<CareersPage />)
    
    expect(screen.getByText(/Submit Application/i)).toBeInTheDocument()
  })
})
