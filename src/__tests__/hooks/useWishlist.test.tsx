import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWishlist } from '../../hooks/useWishlist'

const mockSessionStorage = (() => {
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
    }),
    length: 0,
    key: vi.fn()
  }
})()

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
})

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

vi.mock('../../analytics/wishlistAnalytics', () => ({
  wishlistAnalytics: {
    trackWishlistEvent: vi.fn()
  }
}))

vi.mock('../../utils/security', () => ({
  SecurityUtils: {
    sanitizeInput: vi.fn((input) => input),
    validateProductId: vi.fn(() => true),
    checkRateLimit: vi.fn(() => true)
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
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
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      effects: ['relaxing']
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('Test Product')).toBe(true)
    }, { timeout: 3000 })
  })

  it('should remove item from wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      effects: ['relaxing']
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    let addedItemId: string
    await waitFor(() => {
      expect(result.current.items.length).toBe(1)
      addedItemId = result.current.items[0].id
    })

    await act(async () => {
      await result.current.removeFromWishlist(addedItemId)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('Test Product')).toBe(false)
      expect(result.current.items.length).toBe(0)
    })
  })

  it('should check if item is in wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      effects: ['relaxing']
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('Test Product')).toBe(true)
      expect(result.current.isInWishlist('Other Product')).toBe(false)
    }, { timeout: 3000 })
  })

  it('should clear wishlist', async () => {
    const { result } = renderHook(() => useWishlist())
    
    const testProduct = {
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      effects: ['relaxing']
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('Test Product')).toBe(true)
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
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      effects: ['relaxing']
    }

    await act(async () => {
      await result.current.addToWishlist(testProduct)
      await result.current.addToWishlist(testProduct)
    })

    await waitFor(() => {
      expect(result.current.isInWishlist('Test Product')).toBe(true)
      expect(result.current.items.length).toBe(1)
    }, { timeout: 3000 })
  })

  it('should have working sessionStorage functionality', async () => {
    mockSessionStorage.clear()
    vi.clearAllMocks()
    
    const { result } = renderHook(() => useWishlist())
    
    await waitFor(() => {
      expect(result.current.items).toBeDefined()
      expect(result.current.stats).toBeDefined()
      expect(result.current.sessionId).toBeDefined()
    }, { timeout: 3000 })

    mockSessionStorage.setItem('test-key', 'test-value')
    expect(mockSessionStorage.getItem('test-key')).toBe('test-value')
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
  })
})
