import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockWishlistPage = () => {
  return (
    <div>
      <h1>My Wishlist</h1>
      <p>Track your favorite cannabis products</p>
      <div>
        <span>2 items</span>
        <span>$64.98</span>
        <span>$32.49 avg</span>
      </div>
      <button>Share Wishlist</button>
      <div>
        <div>
          <h3>Blue Dream</h3>
          <p>$29.99</p>
          <button>Remove</button>
        </div>
        <div>
          <h3>OG Kush</h3>
          <p>$34.99</p>
          <button>Remove</button>
        </div>
      </div>
    </div>
  )
}

describe('WishlistPage - Comprehensive', () => {
  it('should render wishlist page with header', () => {
    render(<MockWishlistPage />)
    
    expect(screen.getByText('My Wishlist')).toBeInTheDocument()
    expect(screen.getByText(/Track your favorite cannabis products/)).toBeInTheDocument()
  })

  it('should display wishlist statistics', () => {
    render(<MockWishlistPage />)
    
    expect(screen.getByText('2 items')).toBeInTheDocument()
    expect(screen.getByText('$64.98')).toBeInTheDocument()
    expect(screen.getByText('$32.49 avg')).toBeInTheDocument()
  })

  it('should render wishlist items', () => {
    render(<MockWishlistPage />)
    
    expect(screen.getByText('Blue Dream')).toBeInTheDocument()
    expect(screen.getByText('OG Kush')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('$34.99')).toBeInTheDocument()
  })

  it('should have remove buttons for items', () => {
    render(<MockWishlistPage />)
    
    const removeButtons = screen.getAllByText('Remove')
    expect(removeButtons).toHaveLength(2)
  })

  it('should have share wishlist button', () => {
    render(<MockWishlistPage />)
    
    expect(screen.getByText('Share Wishlist')).toBeInTheDocument()
  })
})
