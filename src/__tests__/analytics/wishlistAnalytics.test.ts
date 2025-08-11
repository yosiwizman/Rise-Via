import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WishlistAnalyticsService, wishlistAnalytics } from '../../analytics/wishlistAnalytics'
import type { WishlistItem } from '../../types/wishlist'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const cryptoMock = {
  randomUUID: vi.fn(() => 'test-uuid-123'),
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })
Object.defineProperty(window, 'crypto', { value: cryptoMock })

const gtagMock = vi.fn()
Object.defineProperty(window, 'gtag', { value: gtagMock })

describe('WishlistAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should be a singleton', () => {
    const instance1 = WishlistAnalyticsService.getInstance()
    const instance2 = WishlistAnalyticsService.getInstance()
    expect(instance1).toBe(instance2)
    expect(instance1).toBe(wishlistAnalytics)
  })

  it('should track wishlist add events', () => {
    const item: WishlistItem = {
      id: 'blue-dream-1',
      name: 'Blue Dream',
      price: 29.99,
      image: '/images/blue-dream.jpg',
      category: 'flower',
      dateAdded: Date.now(),
      priority: 'medium'
    }

    wishlistAnalytics.trackWishlistEvent('add', item)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_analytics',
      expect.stringContaining('"action":"add"')
    )
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_metrics',
      expect.any(String)
    )
  })

  it('should track wishlist remove events', () => {
    const item: WishlistItem = {
      id: 'og-kush-1',
      name: 'OG Kush',
      price: 34.99,
      image: '/images/og-kush.jpg',
      category: 'flower',
      dateAdded: Date.now(),
      priority: 'high'
    }

    wishlistAnalytics.trackWishlistEvent('remove', item)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_analytics',
      expect.stringContaining('"action":"remove"')
    )
  })

  it('should track share events', () => {
    wishlistAnalytics.trackWishlistEvent('share', undefined, { method: 'email' })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_analytics',
      expect.stringContaining('"action":"share"')
    )
  })

  it('should track conversion events', () => {
    const item: WishlistItem = {
      id: 'sour-diesel-1',
      name: 'Sour Diesel',
      price: 32.99,
      image: '/images/sour-diesel.jpg',
      category: 'flower',
      dateAdded: Date.now(),
      priority: 'low'
    }

    wishlistAnalytics.trackWishlistEvent('conversion', item)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_analytics',
      expect.stringContaining('"action":"conversion"')
    )
  })

  it('should get default metrics when no data exists', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const metrics = wishlistAnalytics.getMetrics()

    expect(metrics).toEqual({
      addToWishlistEvents: 0,
      removeFromWishlistEvents: 0,
      shareEvents: 0,
      importEvents: 0,
      conversionEvents: 0,
      averageItemsPerWishlist: 0,
      topCategories: [],
      priceAlertConversions: 0,
      returnVisitorRate: 0
    })
  })

  it('should get stored metrics', () => {
    const storedMetrics = {
      addToWishlistEvents: 5,
      removeFromWishlistEvents: 2,
      shareEvents: 1,
      importEvents: 0,
      conversionEvents: 1,
      averageItemsPerWishlist: 3.2,
      topCategories: [{ category: 'flower', count: 4 }],
      priceAlertConversions: 1,
      returnVisitorRate: 25.5
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedMetrics))

    const metrics = wishlistAnalytics.getMetrics()

    expect(metrics).toEqual(storedMetrics)
  })

  it('should handle malformed metrics data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const metrics = wishlistAnalytics.getMetrics()

    expect(metrics.addToWishlistEvents).toBe(0)
    expect(metrics.removeFromWishlistEvents).toBe(0)
  })

  it('should calculate return visitor rate', () => {
    const events = [
      { userId: 'user1', sessionId: 'session1', action: 'add' },
      { userId: 'user1', sessionId: 'session2', action: 'add' },
      { userId: 'user2', sessionId: 'session3', action: 'add' },
    ]

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'wishlist_analytics') return JSON.stringify(events)
      if (key === 'wishlist_metrics') return null
      return null
    })

    const rate = wishlistAnalytics.calculateReturnVisitorRate()

    expect(rate).toBe(50) // 1 out of 2 users returned
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_metrics',
      expect.stringContaining('"returnVisitorRate":50')
    )
  })

  it('should calculate average items per wishlist', () => {
    const wishlistData = {
      state: {
        items: ['item1', 'item2', 'item3']
      }
    }

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'risevia-wishlist') return JSON.stringify(wishlistData)
      if (key === 'wishlist_analytics') return '[]'
      if (key === 'wishlist_metrics') return null
      return null
    })

    const average = wishlistAnalytics.calculateAverageItemsPerWishlist()

    expect(average).toBe(3)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'wishlist_metrics',
      expect.stringContaining('"averageItemsPerWishlist":3')
    )
  })

  it('should get analytics events with limit', () => {
    const events = Array.from({ length: 150 }, (_, i) => ({
      action: 'add',
      timestamp: Date.now() + i,
      itemId: `item-${i}`
    }))

    localStorageMock.getItem.mockReturnValue(JSON.stringify(events))

    const recentEvents = wishlistAnalytics.getAnalyticsEvents(50)

    expect(recentEvents).toHaveLength(50)
    expect(recentEvents[0].itemId).toBe('item-100') // Last 50 events
  })

  it('should get events by action', () => {
    const events = [
      { action: 'add', itemId: 'item1' },
      { action: 'remove', itemId: 'item2' },
      { action: 'add', itemId: 'item3' },
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(events))

    const addEvents = wishlistAnalytics.getEventsByAction('add')

    expect(addEvents).toHaveLength(2)
    expect(addEvents[0].itemId).toBe('item1')
    expect(addEvents[1].itemId).toBe('item3')
  })

  it('should get events by time range', () => {
    const now = Date.now()
    const events = [
      { action: 'add', timestamp: now - 1000 },
      { action: 'add', timestamp: now },
      { action: 'add', timestamp: now + 1000 },
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(events))

    const rangeEvents = wishlistAnalytics.getEventsByTimeRange(now - 500, now + 500)

    expect(rangeEvents).toHaveLength(1)
    expect(rangeEvents[0].timestamp).toBe(now)
  })

  it('should generate daily report', () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    
    const events = [
      { action: 'add', timestamp: startOfDay + 1000, itemCategory: 'flower' },
      { action: 'add', timestamp: startOfDay + 2000, itemCategory: 'edibles' },
      { action: 'remove', timestamp: startOfDay + 3000, itemCategory: 'flower' },
      { action: 'share', timestamp: startOfDay + 4000 },
      { action: 'conversion', timestamp: startOfDay + 5000 },
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(events))

    const report = wishlistAnalytics.generateDailyReport()

    expect(report.totalEvents).toBe(5)
    expect(report.addEvents).toBe(2)
    expect(report.removeEvents).toBe(1)
    expect(report.shareEvents).toBe(1)
    expect(report.conversionRate).toBe(50) // 1 conversion out of 2 adds
    expect(report.topCategories).toEqual([
      { category: 'flower', count: 2 },
      { category: 'edibles', count: 1 }
    ])
  })

  it('should clear analytics data', () => {
    wishlistAnalytics.clearAnalytics()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('wishlist_analytics')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('wishlist_metrics')
  })

  it('should send events to Google Analytics when gtag is available', () => {
    const item: WishlistItem = {
      id: 'test-item',
      name: 'Test Item',
      price: 25.99,
      image: '/images/test-item.jpg',
      category: 'flower',
      dateAdded: Date.now(),
      priority: 'medium'
    }

    wishlistAnalytics.trackWishlistEvent('add', item)

    expect(gtagMock).toHaveBeenCalledWith('event', 'wishlist_add', {
      event_category: 'wishlist',
      event_label: 'Test Item',
      value: 25.99,
      custom_parameters: {
        item_category: 'flower',
        session_id: 'test-uuid-123',
        user_id: 'test-uuid-123'
      }
    })
  })

  it('should generate session and user IDs', () => {
    sessionStorageMock.getItem.mockReturnValue(null)
    localStorageMock.getItem.mockReturnValue(null)

    wishlistAnalytics.trackWishlistEvent('add')

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('risevia_session_id', 'test-uuid-123')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('risevia_user_id', 'test-uuid-123')
  })

  it('should limit stored events to 1000', () => {
    const existingEvents = Array.from({ length: 1000 }, (_, i) => ({ id: i }))
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingEvents))

    wishlistAnalytics.trackWishlistEvent('add')

    const setItemCall = localStorageMock.setItem.mock.calls.find(call => call[0] === 'wishlist_analytics')
    const storedEvents = JSON.parse(setItemCall[1])
    
    expect(storedEvents).toHaveLength(1000)
    expect(storedEvents[0].id).toBe(1) // First event removed
  })

  it('should handle errors in storeAnalyticsEvent gracefully', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'risevia_user_id') return 'test-user-id'
      if (key === 'wishlist_analytics') throw new Error('Storage error')
      return null
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wishlistAnalytics.trackWishlistEvent('add')

    expect(consoleSpy).toHaveBeenCalledWith('Error storing analytics event:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should handle errors in updateMetrics gracefully', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'wishlist_metrics') throw new Error('Metrics error')
      return null
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    wishlistAnalytics.trackWishlistEvent('add')

    expect(consoleSpy).toHaveBeenCalledWith('Error getting metrics:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })
})
