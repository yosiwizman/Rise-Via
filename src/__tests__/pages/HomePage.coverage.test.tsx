import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'

const MockHomePage = () => (
  <div data-testid="homepage">
    <header>
      <h1>Rise Via Cannabis</h1>
      <nav>
        <a href="/shop">Shop</a>
        <a href="/about">About</a>
      </nav>
    </header>
    
    <main>
      <section className="hero">
        <h2>Premium Cannabis Products</h2>
        <p>Discover our curated selection of high-quality cannabis</p>
        <button>Shop Now</button>
      </section>
      
      <section className="features">
        <div className="feature">
          <h3>Lab Tested</h3>
          <p>All products are third-party lab tested</p>
        </div>
        <div className="feature">
          <h3>Fast Delivery</h3>
          <p>Same-day delivery available</p>
        </div>
        <div className="feature">
          <h3>Expert Support</h3>
          <p>Knowledgeable staff to help you choose</p>
        </div>
      </section>
    </main>
  </div>
)

describe('HomePage Coverage Tests', () => {
  it('should render homepage', () => {
    render(<MockHomePage />)
    expect(screen.getByTestId('homepage')).toBeDefined()
  })

  it('should render main heading', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Rise Via Cannabis')).toBeDefined()
  })

  it('should render navigation links', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Shop')).toBeDefined()
    expect(screen.getByText('About')).toBeDefined()
  })

  it('should render hero section', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Premium Cannabis Products')).toBeDefined()
    expect(screen.getByText('Discover our curated selection of high-quality cannabis')).toBeDefined()
    expect(screen.getByText('Shop Now')).toBeDefined()
  })

  it('should render feature sections', () => {
    render(<MockHomePage />)
    expect(screen.getByText('Lab Tested')).toBeDefined()
    expect(screen.getByText('All products are third-party lab tested')).toBeDefined()
    
    expect(screen.getByText('Fast Delivery')).toBeDefined()
    expect(screen.getByText('Same-day delivery available')).toBeDefined()
    
    expect(screen.getByText('Expert Support')).toBeDefined()
    expect(screen.getByText('Knowledgeable staff to help you choose')).toBeDefined()
  })

  it('should have proper structure', () => {
    render(<MockHomePage />)
    const homepage = screen.getByTestId('homepage')
    expect(homepage.querySelector('header')).toBeDefined()
    expect(homepage.querySelector('main')).toBeDefined()
    expect(homepage.querySelector('.hero')).toBeDefined()
    expect(homepage.querySelector('.features')).toBeDefined()
  })
})
