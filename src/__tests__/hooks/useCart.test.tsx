import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCart } from '../../hooks/useCart'

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

describe('useCart', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart())
    
    expect(result.current.items).toEqual([])
    expect(result.current.items.length).toBe(0)
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toMatchObject({
      name: 'Test Product',
      price: 29.99,
      quantity: 1
    })
  })

  it('should increase quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct, 1)
      result.current.addToCart(testProduct, 2)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(4)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
      result.current.removeFromCart(result.current.items[0].id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
    })

    const itemId = result.current.items[0].id

    act(() => {
      result.current.updateQuantity(itemId, 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
  })

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'cart_analytics',
      expect.stringContaining('"itemName":"Test Product"')
    )
  })

  it('should handle invalid quantity updates', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
      result.current.updateQuantity(result.current.items[0].id, 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should handle negative quantity updates', () => {
    const { result } = renderHook(() => useCart())
    
    const testProduct = {
      productId: 'test-1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg',
      category: 'flower',
      strainType: 'indica',
      thcaPercentage: 25.5
    }

    act(() => {
      result.current.addToCart(testProduct)
    })

    const itemId = result.current.items[0].id

    act(() => {
      result.current.updateQuantity(itemId, -1)
    })

    expect(result.current.items).toHaveLength(0)
  })
})
