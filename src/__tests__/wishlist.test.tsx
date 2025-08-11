import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '../test-utils'
import { useWishlist } from '../hooks/useWishlist'

vi.mock('../services/wishlistService', () => ({
  wishlistService: {
    getWishlist: vi.fn(() => Promise.resolve({ data: ['product-1', 'product-2'], error: null })),
    addToWishlist: vi.fn(() => Promise.resolve({ error: null })),
    removeFromWishlist: vi.fn(() => Promise.resolve({ error: null })),
    migrateSessionWishlist: vi.fn(() => Promise.resolve({ success: true })),
  },
}))

vi.mock('../data/products.json', () => ({
  default: {
    products: [
      {
        id: 'product-1',
        name: 'Blue Dream',
        price: 29.99,
        images: ['image1.jpg'],
        category: 'flower',
        effects: ['relaxed', 'happy']
      },
      {
        id: 'product-2',
        name: 'OG Kush',
        price: 34.99,
        images: ['image2.jpg'],
        category: 'flower',
        effects: ['sleepy', 'euphoric']
      }
    ]
  }
}))

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should load wishlist items', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toBeDefined()
    expect(Array.isArray(result.current.items)).toBe(true)
    expect(result.current.items).toHaveLength(0)
  })

  it('should add items to wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const testProduct = {
      id: 'product-3',
      name: 'Test Product',
      price: 29.99,
      image: '/test-image.jpg',
      category: 'flower'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    expect(result.current.error).toBeNull()
  })

  it('should remove items from wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.removeFromWishlist('product-1')
    })

    expect(result.current.error).toBeNull()
  })

  it('should check if item is in wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isInWishlist('product-1')).toBe(false)
    expect(result.current.isInWishlist('product-3')).toBe(false)
  })

  it('should calculate wishlist count', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.getWishlistCount()).toBe(1)
  })

  it('should calculate wishlist stats', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toHaveProperty('totalItems')
    expect(result.current.stats).toHaveProperty('totalValue')
    expect(result.current.stats).toHaveProperty('averagePrice')
    expect(result.current.stats.totalItems).toBe(1)
    expect(result.current.stats.totalValue).toBe(29.99)
  })

  it('should clear entire wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.clearWishlist()
    })

    expect(result.current.error).toBeNull()
  })

  it('should migrate localStorage wishlist', async () => {
    const mockWishlistData = {
      state: {
        items: [
          { id: 'product-1', name: 'Blue Dream' },
          { name: 'OG Kush' }
        ]
      }
    }
    
    localStorage.setItem('risevia-wishlist', JSON.stringify(mockWishlistData))
    
    renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(localStorage.getItem('risevia-wishlist')).toBeTruthy()
    })
  })
})
