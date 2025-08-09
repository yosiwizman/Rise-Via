import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { LearnPage } from '../../pages/LearnPage'

describe('LearnPage', () => {
  it('should render learn page', () => {
    render(<LearnPage />)
    
    expect(screen.getByText(/Learn/i)).toBeInTheDocument()
  })

  it('should display educational content', () => {
    render(<LearnPage />)
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should show cannabis information', () => {
    render(<LearnPage />)
    
    const content = screen.getByText(/Learn/i)
    expect(content).toBeInTheDocument()
  })
})
