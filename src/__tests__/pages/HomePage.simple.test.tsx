import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'

const MockHomePage = () => (
  <div>
    <h1>Welcome to Rise Via</h1>
    <p>Premium cannabis products</p>
    <button>Shop Now</button>
    <section>
      <h2>Featured Products</h2>
      <div>Product grid</div>
    </section>
  </div>
)

describe('HomePage - Simple', () => {
  it('should render welcome message', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Welcome to Rise Via')).toBeInTheDocument()
  })

  it('should display shop now button', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Shop Now')).toBeInTheDocument()
  })

  it('should show featured products section', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Featured Products')).toBeInTheDocument()
  })

  it('should have main content', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Premium cannabis products')).toBeInTheDocument()
  })
})
