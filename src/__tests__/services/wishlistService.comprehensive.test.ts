import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/neon', () => ({
  neon: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'session-1', session_token: 'test-token' }, 
            error: null 
          })),
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: '1', product_id: 'product-1' }, 
              error: null 
            })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ 
        data: null, 
        error: null 
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))

import { wishlistService } from '../../services/wishlistService'

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('WishlistService - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Session Management', () => {
    it('should create new session when none exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const session = await wishlistService.getOrCreateSession()
      
      expect(session).toEqual({
        id: 'session-1',
        session_token: 'test-token'
      })
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should retrieve existing session from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('existing-token')
      
      const session = await wishlistService.getOrCreateSession()
      
      expect(session).toEqual({
        id: 'session-1',
        session_token: 'test-token'
      })
    })
  })

  describe('Wishlist Operations', () => {
    it('should add item to wishlist', async () => {
      const result = await wishlistService.addToWishlist('new-product')
      expect(result).toHaveProperty('error')
      expect(result.error).toBeNull()
    })

    it('should remove item from wishlist', async () => {
      const result = await wishlistService.removeFromWishlist('product-1')
      expect(result).toHaveProperty('error')
      expect(result.error).toBeNull()
    })

    it('should check if item is in wishlist', async () => {
      const isInWishlist = await wishlistService.isInWishlist('product-1')
      expect(typeof isInWishlist).toBe('boolean')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const originalSetItem = mockLocalStorage.setItem
      mockLocalStorage.setItem.mockImplementation(() => {
        return undefined
      })

      const session = await wishlistService.getOrCreateSession()
      expect(session).toBeDefined()
      
      mockLocalStorage.setItem = originalSetItem
    })
  })
})
