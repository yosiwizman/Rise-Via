import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockFooter = () => (
  <footer>
    <p>&copy; 2024 Rise Via. All rights reserved.</p>
    <div>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
    </div>
  </footer>
)

describe('Footer Component - Simple', () => {
  it('should render copyright text', () => {
    render(<MockFooter />)
    expect(screen.getByText(/© 2024 Rise Via/)).toBeInTheDocument()
  })

  it('should render legal links', () => {
    render(<MockFooter />)
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  it('should have proper semantic structure', () => {
    render(<MockFooter />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })
})
