import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '../test-utils'
import { useCart } from '../hooks/useCart'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

vi.mock('../utils/security', () => ({
  SecurityUtils: {
    checkRateLimit: vi.fn(() => true),
    sanitizeInput: vi.fn((input) => input),
  },
}))

vi.mock('../analytics/cartAnalytics', () => ({
  cartAnalytics: {
    trackCartEvent: vi.fn(),
  },
}))

Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
})

describe('useCart', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    vi.clearAllMocks()
  })

  it('should add items to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.getCartCount()).toBe(1)
    expect(result.current.getCartTotal()).toBe(29.99)
  })

  it('should update quantity for existing items', () => {
    const { result } = renderHook(() => useCart())
    
    const product = {
      productId: '1',
      name: 'Test Product',
      price: 29.99,
      originalPrice: 29.99,
      category: 'flower',
      image: 'test.jpg',
      strainType: 'hybrid',
      thcaPercentage: 20
    }

    act(() => {
      result.current.addToCart(product)
      result.current.addToCart(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.getCartTotal()).toBe(89.97)
  })

  it('should remove items from cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
    })

    const itemId = result.current.items[0].id

    act(() => {
      result.current.removeFromCart(itemId)
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getCartCount()).toBe(0)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
    })

    const itemId = result.current.items[0].id

    act(() => {
      result.current.updateQuantity(itemId, 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.getCartTotal()).toBe(89.97)
  })

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
    })

    const itemId = result.current.items[0].id

    act(() => {
      result.current.updateQuantity(itemId, 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product 1',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test1.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
      result.current.addToCart({
        productId: '2',
        name: 'Test Product 2',
        price: 39.99,
        originalPrice: 39.99,
        category: 'flower',
        image: 'test2.jpg',
        strainType: 'indica',
        thcaPercentage: 25
      })
    })

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getCartCount()).toBe(0)
  })

  it('should check if product is in cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      })
    })

    expect(result.current.isInCart('1')).toBe(true)
    expect(result.current.isInCart('2')).toBe(false)
  })

  it('should toggle cart open state', () => {
    const { result } = renderHook(() => useCart())
    
    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.setCartOpen(true)
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should calculate cart stats correctly', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Product 1',
        price: 29.99,
        originalPrice: 29.99,
        category: 'flower',
        image: 'test1.jpg',
        strainType: 'hybrid',
        thcaPercentage: 20
      }, 2)
      result.current.addToCart({
        productId: '2',
        name: 'Test Product 2',
        price: 39.99,
        originalPrice: 39.99,
        category: 'flower',
        image: 'test2.jpg',
        strainType: 'indica',
        thcaPercentage: 25
      })
    })

    expect(result.current.stats.totalItems).toBe(2)
    expect(result.current.stats.itemCount).toBe(4)
    expect(result.current.stats.totalValue).toBe(129.96)
  })
})
