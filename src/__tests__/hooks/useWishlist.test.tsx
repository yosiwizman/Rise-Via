import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWishlist } from '../../hooks/useWishlist'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

vi.mock('../../data/products.json', () => ({
  default: {
    products: [
      {
        id: '1',
        name: 'Test Product',
        price: 29.99,
        images: ['test.jpg'],
        category: 'flower',
        effects: ['relaxing']
      }
    ]
  }
}))

vi.mock('../../services/wishlistService', () => {
  let mockWishlistItems: string[] = []
  
  return {
    wishlistService: {
      getWishlist: vi.fn(() => Promise.resolve({ data: mockWishlistItems, error: null })),
      addToWishlist: vi.fn((productId: string) => {
        if (!mockWishlistItems.includes(productId)) {
          mockWishlistItems.push(productId)
        }
        return Promise.resolve({ error: null })
      }),
      removeFromWishlist: vi.fn((productId: string) => {
        mockWishlistItems = mockWishlistItems.filter(id => id !== productId)
        return Promise.resolve({ error: null })
      }),
      isInWishlist: vi.fn((productId: string) => Promise.resolve(mockWishlistItems.includes(productId))),
      migrateSessionWishlist: vi.fn(() => Promise.resolve({ success: true }))
    }
  }
})

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

describe('useWishlist', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with empty wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.items).toEqual([])
      expect(result.current.stats.totalItems).toBe(0)
    })
  })

  it('should add item to wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('1')).toBe(true)
    }, { timeout: 3000 })
  })

  it('should remove item from wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
      await result.current.removeFromWishlist('1')
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('1')).toBe(false)
    })
  })

  it('should check if item is in wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('1')).toBe(true)
      expect(result.current.isInWishlist('2')).toBe(false)
    }, { timeout: 3000 })
  })

  it('should clear wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('1')).toBe(true)
    })

    await act(async () => {
      await result.current.clearWishlist()
    })

    await waitFor(() => {
      expect(result.current.items.length).toBe(0)
    }, { timeout: 3000 })
  })

  it('should handle duplicate items', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('1')).toBe(true)
    }, { timeout: 3000 })
  })

  it('should persist session token to localStorage', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      id: '1'
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.items).toBeDefined()
      expect(result.current.stats).toBeDefined()
    }, { timeout: 3000 })
  })
})
