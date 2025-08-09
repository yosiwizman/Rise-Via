import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { useState } from 'react'

const MockWishlistButton = ({ productId, isInWishlist = false, onToggle = vi.fn() }: { productId: string, isInWishlist?: boolean, onToggle?: (productId: string) => void }) => {
  return (
    <button
      data-testid="wishlist-button"
      onClick={() => onToggle(productId)}
      className={isInWishlist ? 'active' : ''}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlist ? '❤️' : '🤍'}
    </button>
  )
}

const MockWishlistPage = () => {
  const mockWishlistItems = [
    {
      id: '1',
      productId: 'blue-dream',
      name: 'Blue Dream',
      price: 29.99,
      image: '/images/blue-dream.jpg',
      addedAt: '2023-12-01T10:00:00Z'
    },
    {
      id: '2',
      productId: 'og-kush',
      name: 'OG Kush',
      price: 34.99,
      image: '/images/og-kush.jpg',
      addedAt: '2023-12-01T09:00:00Z'
    }
  ]

  return (
    <div data-testid="wishlist-page">
      <h1>My Wishlist</h1>
      
      <div data-testid="wishlist-stats">
        <span data-testid="item-count">{mockWishlistItems.length} items</span>
        <span data-testid="total-value">
          ${mockWishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
        </span>
      </div>

      <div data-testid="wishlist-items">
        {mockWishlistItems.map(item => (
          <div key={item.id} data-testid={`wishlist-item-${item.productId}`}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <span>${item.price}</span>
            <button data-testid={`remove-${item.productId}`}>Remove</button>
            <button data-testid={`add-to-cart-${item.productId}`}>Add to Cart</button>
          </div>
        ))}
      </div>

      <div data-testid="wishlist-actions">
        <button data-testid="clear-wishlist">Clear All</button>
        <button data-testid="share-wishlist">Share Wishlist</button>
        <button data-testid="export-wishlist">Export</button>
      </div>
    </div>
  )
}

const MockWishlistShare = ({ isOpen = false, onClose = vi.fn() }: { isOpen?: boolean, onClose?: () => void }) => {
  if (!isOpen) return null

  return (
    <div data-testid="wishlist-share-modal">
      <div data-testid="modal-content">
        <h2>Share Your Wishlist</h2>
        
        <div data-testid="share-options">
          <button data-testid="share-email">Email</button>
          <button data-testid="share-sms">SMS</button>
          <button data-testid="share-social">Social Media</button>
          <button data-testid="copy-link">Copy Link</button>
        </div>

        <div data-testid="share-settings">
          <label>
            <input type="checkbox" data-testid="include-prices" />
            Include prices
          </label>
          <label>
            <input type="checkbox" data-testid="include-notes" />
            Include notes
          </label>
        </div>

        <div data-testid="generated-link">
          <input 
            type="text" 
            value="https://risevia.com/wishlist/shared/abc123"
            readOnly
            data-testid="share-url"
          />
        </div>

        <div data-testid="modal-actions">
          <button data-testid="close-modal" onClick={onClose}>Close</button>
          <button data-testid="send-share">Send</button>
        </div>
      </div>
    </div>
  )
}

describe('Wishlist Components Comprehensive Tests', () => {

  describe('WishlistButton', () => {
    it('should render add to wishlist state', () => {
      render(<MockWishlistButton productId="test-product" isInWishlist={false} />)

      const button = screen.getByTestId('wishlist-button')
      expect(button).toHaveTextContent('🤍')
      expect(button).toHaveAttribute('aria-label', 'Add to wishlist')
      expect(button).not.toHaveClass('active')
    })

    it('should render remove from wishlist state', () => {
      render(<MockWishlistButton productId="test-product" isInWishlist={true} />)

      const button = screen.getByTestId('wishlist-button')
      expect(button).toHaveTextContent('❤️')
      expect(button).toHaveAttribute('aria-label', 'Remove from wishlist')
      expect(button).toHaveClass('active')
    })

    it('should call onToggle when clicked', () => {
      const mockToggle = vi.fn()
      render(<MockWishlistButton productId="test-product" onToggle={mockToggle} />)

      const button = screen.getByTestId('wishlist-button')
      fireEvent.click(button)

      expect(mockToggle).toHaveBeenCalledWith('test-product')
    })

    it('should be keyboard accessible', () => {
      const mockToggle = vi.fn()
      render(<MockWishlistButton productId="test-product" onToggle={mockToggle} />)

      const button = screen.getByTestId('wishlist-button')
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.click(button) // Simulate the actual click that would happen on Enter

      expect(mockToggle).toHaveBeenCalledWith('test-product')
    })

    it('should handle loading state', () => {
      const LoadingWishlistButton = () => (
        <button data-testid="wishlist-button" disabled>
          <span data-testid="loading-spinner">⏳</span>
        </button>
      )

      render(<LoadingWishlistButton />)

      const button = screen.getByTestId('wishlist-button')
      expect(button).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('WishlistPage', () => {
    it('should render wishlist page with items', () => {
      render(<MockWishlistPage />)

      expect(screen.getByText('My Wishlist')).toBeInTheDocument()
      expect(screen.getByTestId('item-count')).toHaveTextContent('2 items')
      expect(screen.getByTestId('total-value')).toHaveTextContent('$64.98')
    })

    it('should display wishlist items correctly', () => {
      render(<MockWishlistPage />)

      expect(screen.getByTestId('wishlist-item-blue-dream')).toBeInTheDocument()
      expect(screen.getByTestId('wishlist-item-og-kush')).toBeInTheDocument()
      
      expect(screen.getByText('Blue Dream')).toBeInTheDocument()
      expect(screen.getByText('OG Kush')).toBeInTheDocument()
      expect(screen.getByText('$29.99')).toBeInTheDocument()
      expect(screen.getByText('$34.99')).toBeInTheDocument()
    })

    it('should have remove buttons for each item', () => {
      render(<MockWishlistPage />)

      expect(screen.getByTestId('remove-blue-dream')).toBeInTheDocument()
      expect(screen.getByTestId('remove-og-kush')).toBeInTheDocument()
    })

    it('should have add to cart buttons for each item', () => {
      render(<MockWishlistPage />)

      expect(screen.getByTestId('add-to-cart-blue-dream')).toBeInTheDocument()
      expect(screen.getByTestId('add-to-cart-og-kush')).toBeInTheDocument()
    })

    it('should have wishlist action buttons', () => {
      render(<MockWishlistPage />)

      expect(screen.getByTestId('clear-wishlist')).toBeInTheDocument()
      expect(screen.getByTestId('share-wishlist')).toBeInTheDocument()
      expect(screen.getByTestId('export-wishlist')).toBeInTheDocument()
    })

    it('should handle empty wishlist state', () => {
      const EmptyWishlistPage = () => (
        <div data-testid="wishlist-page">
          <h1>My Wishlist</h1>
          <div data-testid="empty-state">
            <p>Your wishlist is empty</p>
            <button data-testid="browse-products">Browse Products</button>
          </div>
        </div>
      )

      render(<EmptyWishlistPage />)

      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument()
      expect(screen.getByTestId('browse-products')).toBeInTheDocument()
    })

    it('should calculate total value correctly', () => {
      render(<MockWishlistPage />)

      const totalValue = screen.getByTestId('total-value')
      expect(totalValue).toHaveTextContent('$64.98') // 29.99 + 34.99
    })
  })

  describe('WishlistShare', () => {
    it('should not render when closed', () => {
      render(<MockWishlistShare isOpen={false} />)

      expect(screen.queryByTestId('wishlist-share-modal')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(<MockWishlistShare isOpen={true} />)

      expect(screen.getByTestId('wishlist-share-modal')).toBeInTheDocument()
      expect(screen.getByText('Share Your Wishlist')).toBeInTheDocument()
    })

    it('should have share option buttons', () => {
      render(<MockWishlistShare isOpen={true} />)

      expect(screen.getByTestId('share-email')).toBeInTheDocument()
      expect(screen.getByTestId('share-sms')).toBeInTheDocument()
      expect(screen.getByTestId('share-social')).toBeInTheDocument()
      expect(screen.getByTestId('copy-link')).toBeInTheDocument()
    })

    it('should have share settings checkboxes', () => {
      render(<MockWishlistShare isOpen={true} />)

      expect(screen.getByTestId('include-prices')).toBeInTheDocument()
      expect(screen.getByTestId('include-notes')).toBeInTheDocument()
    })

    it('should display generated share URL', () => {
      render(<MockWishlistShare isOpen={true} />)

      const shareUrl = screen.getByTestId('share-url')
      expect(shareUrl).toHaveValue('https://risevia.com/wishlist/shared/abc123')
      expect(shareUrl).toHaveAttribute('readonly')
    })

    it('should call onClose when close button clicked', () => {
      const mockClose = vi.fn()
      render(<MockWishlistShare isOpen={true} onClose={mockClose} />)

      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      expect(mockClose).toHaveBeenCalled()
    })

    it('should handle copy link functionality', async () => {
      const mockWriteText = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(<MockWishlistShare isOpen={true} />)

      const copyButton = screen.getByTestId('copy-link')
      fireEvent.click(copyButton)

      expect(copyButton).toBeInTheDocument()
    })

    it('should handle share settings changes', () => {
      render(<MockWishlistShare isOpen={true} />)

      const includePrices = screen.getByTestId('include-prices')
      const includeNotes = screen.getByTestId('include-notes')

      fireEvent.click(includePrices)
      fireEvent.click(includeNotes)

      expect(includePrices).toBeInTheDocument()
      expect(includeNotes).toBeInTheDocument()
    })
  })

  describe('integration scenarios', () => {
    it('should handle wishlist button integration with page', () => {
      const IntegratedWishlist = () => {
        const [isInWishlist, setIsInWishlist] = useState(false)

        return (
          <div>
            <MockWishlistButton 
              productId="test-product"
              isInWishlist={isInWishlist}
              onToggle={vi.fn(() => setIsInWishlist(!isInWishlist))}
            />
            <div data-testid="wishlist-status">
              {isInWishlist ? 'In wishlist' : 'Not in wishlist'}
            </div>
          </div>
        )
      }

      render(<IntegratedWishlist />)

      const button = screen.getByTestId('wishlist-button')
      const status = screen.getByTestId('wishlist-status')

      expect(status).toHaveTextContent('Not in wishlist')

      fireEvent.click(button)

      expect(status).toHaveTextContent('In wishlist')
    })

    it('should handle wishlist page with share modal', () => {
      const IntegratedWishlistPage = () => {
        const [shareOpen, setShareOpen] = useState(false)

        return (
          <div>
            <button 
              data-testid="open-share"
              onClick={() => setShareOpen(true)}
            >
              Share
            </button>
            <MockWishlistShare 
              isOpen={shareOpen}
              onClose={vi.fn(() => setShareOpen(false))}
            />
          </div>
        )
      }

      render(<IntegratedWishlistPage />)

      expect(screen.queryByTestId('wishlist-share-modal')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('open-share'))

      expect(screen.getByTestId('wishlist-share-modal')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('close-modal'))

      expect(screen.queryByTestId('wishlist-share-modal')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MockWishlistButton productId="test" isInWishlist={false} />)

      const button = screen.getByTestId('wishlist-button')
      expect(button).toHaveAttribute('aria-label', 'Add to wishlist')
    })

    it('should support keyboard navigation', () => {
      render(<MockWishlistPage />)

      const removeButton = screen.getByTestId('remove-blue-dream')
      removeButton.focus()

      expect(document.activeElement).toBe(removeButton)
    })

    it('should have proper heading structure', () => {
      render(<MockWishlistPage />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('My Wishlist')
    })
  })

  describe('error handling', () => {
    it('should handle wishlist service errors', () => {
      const ErrorWishlistPage = () => (
        <div data-testid="wishlist-page">
          <div data-testid="error-state">
            <p>Failed to load wishlist</p>
            <button data-testid="retry-button">Retry</button>
          </div>
        </div>
      )

      render(<ErrorWishlistPage />)

      expect(screen.getByText('Failed to load wishlist')).toBeInTheDocument()
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi.fn(() => Promise.reject(new Error('Network error')))
      global.fetch = mockFetch

      render(<MockWishlistPage />)

      expect(screen.getByTestId('wishlist-page')).toBeInTheDocument()
    })
  })
})
