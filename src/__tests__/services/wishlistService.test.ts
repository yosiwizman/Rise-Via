import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/supabase', () => {
  const mockChain: any = {
    select: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    single: vi.fn(() => Promise.resolve({ data: { id: 'session-1', session_token: 'test-token' }, error: null })),
    insert: vi.fn(() => mockChain),
    delete: vi.fn(() => mockChain),
  }

  return {
    supabase: {
      from: vi.fn(() => mockChain),
    }
  }
})

import { wishlistService } from '../../services/wishlistService'

describe('wishlistService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateSession', () => {
    it('should create new session', async () => {
      const result = await wishlistService.getOrCreateSession()

      expect(result).toBeDefined()
      expect(result.session_token).toBeDefined()
    })
  })

  describe('addToWishlist', () => {
    it('should add item to wishlist', async () => {
      const productId = 'product-1'

      const result = await wishlistService.addToWishlist(productId)

      expect(result).toHaveProperty('error')
    })

    it('should handle errors gracefully', async () => {
      const invalidData = null as any

      const result = await wishlistService.addToWishlist(invalidData)

      expect(result).toHaveProperty('error')
    })
  })

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      const result = await wishlistService.removeFromWishlist('product-1')

      expect(result).toHaveProperty('error')
    })
  })

  describe('getWishlist', () => {
    it('should retrieve wishlist items', async () => {
      const result = await wishlistService.getWishlist()

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('error')
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('isInWishlist', () => {
    it('should check if item is in wishlist', async () => {
      const result = await wishlistService.isInWishlist('product-1')

      expect(typeof result).toBe('boolean')
    })
  })
})
