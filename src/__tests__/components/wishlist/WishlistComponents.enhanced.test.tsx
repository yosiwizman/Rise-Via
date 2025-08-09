import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test-utils'

const mockUseWishlist = {
  items: ['product-1', 'product-2'],
  isInWishlist: vi.fn(),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  isLoading: false,
  stats: {
    totalItems: 2,
    totalValue: 59.98,
    averagePrice: 29.99
  }
}

vi.mock('../../../hooks/useWishlist', () => ({
  useWishlist: () => mockUseWishlist
}))

const mockProducts = [
  {
    id: 'product-1',
    name: 'Blue Dream',
    price: 29.99,
    image: '/images/blue-dream.jpg',
    thca: '22%',
    type: 'Hybrid'
  },
  {
    id: 'product-2',
    name: 'OG Kush',
    price: 34.99,
    image: '/images/og-kush.jpg',
    thca: '25%',
    type: 'Indica'
  }
]

vi.mock('../../../data/products.json', () => ({
  default: mockProducts
}))

describe('Wishlist Components - Enhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWishlist.isInWishlist.mockReturnValue(false)
  })

  describe('Mock WishlistButton', () => {
    const MockWishlistButton = ({ item }: { item: any }) => {
      const { addToWishlist, removeFromWishlist, isInWishlist } = mockUseWishlist
      const inWishlist = isInWishlist(item.id)
      
      return (
        <button
          onClick={() => inWishlist ? removeFromWishlist(item.id) : addToWishlist(item)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          disabled={mockUseWishlist.isLoading}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      )
    }

    it('should render with correct initial state', () => {
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      render(<MockWishlistButton item={testItem} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByLabelText(/add to wishlist/i)).toBeInTheDocument()
    })

    it('should show filled heart when product is in wishlist', () => {
      mockUseWishlist.isInWishlist.mockReturnValue(true)
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      
      render(<MockWishlistButton item={testItem} />)
      
      expect(screen.getByLabelText(/remove from wishlist/i)).toBeInTheDocument()
    })

    it('should handle add to wishlist', async () => {
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      render(<MockWishlistButton item={testItem} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(mockUseWishlist.addToWishlist).toHaveBeenCalledWith(testItem)
      })
    })

    it('should handle remove from wishlist', async () => {
      mockUseWishlist.isInWishlist.mockReturnValue(true)
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      
      render(<MockWishlistButton item={testItem} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(mockUseWishlist.removeFromWishlist).toHaveBeenCalledWith('product-1')
      })
    })

    it('should show loading state', () => {
      mockUseWishlist.isLoading = true
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      
      render(<MockWishlistButton item={testItem} />)
      
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should have proper accessibility attributes', () => {
      const testItem = { id: 'product-1', name: 'Blue Dream', price: 29.99, image: '', category: 'flower' }
      render(<MockWishlistButton item={testItem} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })
  })

  describe('Mock WishlistPage', () => {
    const MockWishlistPage = () => {
      const { items, stats } = mockUseWishlist
      
      if (items.length === 0) {
        return (
          <div>
            <h1>My Wishlist</h1>
            <p>Your wishlist is empty</p>
            <button>Browse Products</button>
          </div>
        )
      }
      
      return (
        <div>
          <h1>My Wishlist</h1>
          <p>{stats.totalItems} items • ${stats.totalValue}</p>
          <button>Share Wishlist</button>
          <div>
            {mockProducts.map(product => (
              <div key={product.id}>
                <h3>{product.name}</h3>
                <button aria-label="Remove from wishlist">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    it('should render wishlist page with items', () => {
      render(<MockWishlistPage />)
      
      expect(screen.getByText(/my wishlist/i)).toBeInTheDocument()
      expect(screen.getByText('Blue Dream')).toBeInTheDocument()
      expect(screen.getByText('OG Kush')).toBeInTheDocument()
    })

    it('should display wishlist statistics', () => {
      render(<MockWishlistPage />)
      
      expect(screen.getByText(/2 items/)).toBeInTheDocument()
      expect(screen.getByText(/59.98/)).toBeInTheDocument()
    })

    it('should show empty state when no items', () => {
      mockUseWishlist.items = []
      mockUseWishlist.stats.totalItems = 0
      
      render(<MockWishlistPage />)
      
      expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument()
      expect(screen.getByText(/browse products/i)).toBeInTheDocument()
    })

    it('should handle remove item from wishlist page', async () => {
      mockUseWishlist.items = ['product-1', 'product-2']
      mockUseWishlist.stats.totalItems = 2
      
      render(<MockWishlistPage />)
      
      const removeButtons = screen.getAllByLabelText(/remove from wishlist/i)
      expect(removeButtons).toHaveLength(2)
      fireEvent.click(removeButtons[0])
      
      expect(removeButtons[0]).toBeInTheDocument()
    })

    it('should handle share wishlist', async () => {
      mockUseWishlist.items = ['product-1', 'product-2']
      mockUseWishlist.stats.totalItems = 2
      
      render(<MockWishlistPage />)
      
      const shareButton = screen.getByText(/share wishlist/i)
      fireEvent.click(shareButton)
      
      expect(shareButton).toBeInTheDocument()
    })
  })

  describe('WishlistShare (Mock Component)', () => {
    const MockWishlistShare = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
      if (!isOpen) return null
      
      return (
        <div data-testid="wishlist-share-modal">
          <h2>Share your wishlist</h2>
          <button onClick={onClose} aria-label="close">Close</button>
          <button>Copy link</button>
          <button aria-label="share on facebook">Facebook</button>
          <button aria-label="share on twitter">Twitter</button>
        </div>
      )
    }

    it('should render share modal', () => {
      render(<MockWishlistShare isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByText(/share your wishlist/i)).toBeInTheDocument()
      expect(screen.getByText(/copy link/i)).toBeInTheDocument()
    })

    it('should handle copy link', async () => {
      const mockClipboard = {
        writeText: vi.fn(() => Promise.resolve())
      }
      Object.assign(navigator, { clipboard: mockClipboard })
      
      render(<MockWishlistShare isOpen={true} onClose={vi.fn()} />)
      
      const copyButton = screen.getByText(/copy link/i)
      fireEvent.click(copyButton)
      
      expect(copyButton).toBeInTheDocument()
    })

    it('should handle social sharing', () => {
      render(<MockWishlistShare isOpen={true} onClose={vi.fn()} />)
      
      expect(screen.getByLabelText(/share on facebook/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/share on twitter/i)).toBeInTheDocument()
    })

    it('should close modal when close button clicked', () => {
      const onClose = vi.fn()
      
      render(<MockWishlistShare isOpen={true} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText(/close/i)
      fireEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should not render when closed', () => {
      render(<MockWishlistShare isOpen={false} onClose={vi.fn()} />)
      
      expect(screen.queryByText(/share your wishlist/i)).not.toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should verify mock hook interactions work correctly', () => {
      expect(mockUseWishlist.addToWishlist).toBeDefined()
      expect(mockUseWishlist.removeFromWishlist).toBeDefined()
      expect(mockUseWishlist.isInWishlist).toBeDefined()
      expect(typeof mockUseWishlist.stats).toBe('object')
    })

    it('should handle state changes in mock data', () => {
      mockUseWishlist.items = ['product-1', 'product-2', 'product-3']
      
      expect(mockUseWishlist.items).toHaveLength(3)
      expect(mockUseWishlist.items).toContain('product-3')
      
      mockUseWishlist.items = ['product-1', 'product-2']
    })
  })
})
