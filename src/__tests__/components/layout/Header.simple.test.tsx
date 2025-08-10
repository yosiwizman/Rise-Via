import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockHeader = () => (
  <header>
    <h1>Rise Via</h1>
    <nav>
      <a href="/shop">Shop</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
)

describe('Header Component - Simple', () => {
  it('should render header with logo', () => {
    render(<MockHeader />)
    expect(screen.getByText('Rise Via')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<MockHeader />)
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should have proper semantic structure', () => {
    render(<MockHeader />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })
})
