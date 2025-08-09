import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { priceTrackingService } from '../../services/priceTracking'

const PriceTrackingService = (priceTrackingService as unknown as { constructor: new () => typeof priceTrackingService }).constructor

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})


Object.defineProperty(window, 'Notification', {
  value: vi.fn().mockImplementation((title, options) => ({
    title,
    ...options,
  })),
  writable: true,
})

Object.defineProperty(Notification, 'permission', {
  value: 'granted',
  writable: true,
})

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn(() => Promise.resolve('granted')),
  writable: true,
})

describe('PriceTrackingService - Comprehensive', () => {
  let service: typeof priceTrackingService

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    service = priceTrackingService
  })

  afterEach(() => {
    service.stopPriceTracking()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = (PriceTrackingService as unknown as { getInstance: () => unknown }).getInstance()
      const instance2 = (PriceTrackingService as unknown as { getInstance: () => unknown }).getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Price Tracking Control', () => {
    it('should start price tracking', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      service.startPriceTracking()
      expect(consoleSpy).toHaveBeenCalledWith('🔔 Price tracking service started')
    })

    it('should stop price tracking', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      service.startPriceTracking()
      service.stopPriceTracking()
      expect(consoleSpy).toHaveBeenCalledWith('🔕 Price tracking service stopped')
    })

    it('should clear existing interval when starting new tracking', () => {
      service.startPriceTracking()
      service.startPriceTracking() // Should clear previous interval
      expect(console.log).toHaveBeenCalledWith('🔔 Price tracking service started')
    })
  })

  describe('Triggered Alerts Management', () => {
    it('should get triggered alerts', () => {
      const mockAlerts = [
        {
          itemId: 'test-product',
          currentPrice: 24.99,
          targetPrice: 25.99,
          triggeredAt: Date.now()
        }
      ]
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockAlerts))
      
      const alerts = service.getTriggeredAlerts()
      expect(alerts).toEqual(mockAlerts)
    })

    it('should return empty array when no triggered alerts exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const alerts = service.getTriggeredAlerts()
      expect(alerts).toEqual([])
    })

    it('should handle corrupted triggered alerts data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const consoleSpy = vi.spyOn(console, 'error')
      
      const alerts = service.getTriggeredAlerts()
      expect(alerts).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error getting triggered alerts:', expect.any(Error))
    })

    it('should clear triggered alerts', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      service.clearTriggeredAlerts()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('risevia-price-alerts')
      expect(consoleSpy).toHaveBeenCalledWith('🗑️ Cleared all triggered price alerts')
    })
  })

  describe('Price Check Activity', () => {
    it('should get price check activity', () => {
      const mockActivity = [
        {
          timestamp: Date.now(),
          itemsChecked: 5,
          alertsTriggered: 2,
          averagePriceChange: -5.2
        }
      ]
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockActivity))
      
      const activity = service.getPriceCheckActivity()
      expect(activity).toEqual(mockActivity)
    })

    it('should return empty array when no activity exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const activity = service.getPriceCheckActivity()
      expect(activity).toEqual([])
    })

    it('should handle corrupted activity data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const consoleSpy = vi.spyOn(console, 'error')
      
      const activity = service.getPriceCheckActivity()
      expect(activity).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error getting price check activity:', expect.any(Error))
    })
  })

  describe('Alert Statistics', () => {
    it('should calculate alert statistics with wishlist data', () => {
      const mockWishlistData = {
        state: {
          items: [
            {
              id: 'item1',
              priceAlert: { isActive: true, targetPrice: 25.99 }
            },
            {
              id: 'item2',
              priceAlert: { isActive: true, targetPrice: 30.99 }
            },
            {
              id: 'item3',
              priceAlert: { isActive: false, targetPrice: 20.99 }
            }
          ]
        }
      }

      const mockTriggeredAlerts = [
        { triggeredAt: Date.now() },
        { triggeredAt: Date.now() - 86400000 } // Yesterday
      ]

      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockWishlistData)) // For wishlist data
        .mockReturnValueOnce(JSON.stringify(mockTriggeredAlerts)) // For triggered alerts

      const stats = service.getAlertStats()
      
      expect(stats.totalAlerts).toBe(2)
      expect(stats.activeAlerts).toBe(2)
      expect(stats.triggeredToday).toBe(1)
      expect(stats.averageResponseTime).toBe(300) // 5 minutes in seconds
    })

    it('should handle empty wishlist data for statistics', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const stats = service.getAlertStats()
      expect(stats.totalAlerts).toBe(0)
      expect(stats.activeAlerts).toBe(0)
      expect(stats.triggeredToday).toBe(0)
      expect(stats.averageResponseTime).toBe(300)
    })

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const consoleSpy = vi.spyOn(console, 'error')
      
      const stats = service.getAlertStats()
      expect(stats).toEqual({
        totalAlerts: 0,
        activeAlerts: 0,
        triggeredToday: 0,
        averageResponseTime: 0
      })
      expect(consoleSpy).toHaveBeenCalledWith('Error getting alert stats:', expect.any(Error))
    })
  })

  describe('Price Simulation', () => {
    it('should simulate price changes with volatility', () => {
      const originalPrice = 30.00
      const targetPrice = 25.00
      
      const prices = []
      for (let i = 0; i < 10; i++) {
        const simulatedPrice = (service as unknown as { simulatePriceChange: (orig: number, target: number) => number }).simulatePriceChange(originalPrice, targetPrice)
        prices.push(simulatedPrice)
        expect(simulatedPrice).toBeGreaterThan(0)
      }
      
      const uniquePrices = new Set(prices)
      expect(uniquePrices.size).toBeGreaterThan(1)
    })

    it('should occasionally return prices near target', () => {
      const originalPrice = 30.00
      const targetPrice = 25.00
      
      const originalRandom = Math.random
      Math.random = vi.fn().mockReturnValue(0.01) // Less than 0.05 threshold
      
      const simulatedPrice = (service as unknown as { simulatePriceChange: (orig: number, target: number) => number }).simulatePriceChange(originalPrice, targetPrice)
      expect(simulatedPrice).toBeLessThan(targetPrice)
      expect(simulatedPrice).toBeGreaterThan(targetPrice * 0.95)
      
      Math.random = originalRandom
    })
  })

  describe('Browser Notifications', () => {
    it('should show browser notification when permission granted', async () => {
      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99,
        triggeredAt: Date.now()
      }

      await (service as unknown as { showBrowserNotification: (data: unknown) => Promise<void> }).showBrowserNotification(alertData)
      
      expect(window.Notification).toHaveBeenCalledWith(
        'RiseViA Price Alert! 🎯',
        expect.objectContaining({
          body: 'Your target price has been reached! Current price: $24.99',
          icon: '/risevia-logo.png',
          tag: 'price-alert-test-product',
          requireInteraction: true
        })
      )
    })

    it('should request permission when not granted', async () => {
      Object.defineProperty(Notification, 'permission', {
        value: 'default',
        writable: true,
      })

      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99,
        triggeredAt: Date.now()
      }

      await (service as unknown as { showBrowserNotification: (data: unknown) => Promise<void> }).showBrowserNotification(alertData)
      
      expect(Notification.requestPermission).toHaveBeenCalled()
    })

    it('should handle notification not supported', async () => {
      const originalNotification = window.Notification
      delete (window as { Notification?: unknown }).Notification

      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99,
        triggeredAt: Date.now()
      }

      await expect((service as unknown as { showBrowserNotification: (data: unknown) => Promise<void> }).showBrowserNotification(alertData)).resolves.toBeUndefined()
      
      ;(window as { Notification?: unknown }).Notification = originalNotification
    })
  })

  describe('Data Storage', () => {
    it('should store triggered alerts with size limit', () => {
      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99,
        triggeredAt: Date.now()
      }

      const existingAlerts = Array.from({ length: 100 }, (_, i) => ({
        itemId: `product-${i}`,
        triggeredAt: Date.now() - i * 1000
      }))

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingAlerts))
      
      ;(service as unknown as { storeTriggeredAlert: (data: unknown) => void }).storeTriggeredAlert(alertData)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'risevia-price-alerts',
        expect.stringContaining('test-product')
      )
    })

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const consoleSpy = vi.spyOn(console, 'error')
      const alertData = { itemId: 'test', triggeredAt: Date.now() }

      expect(() => {
        ;(service as unknown as { storeTriggeredAlert: (data: unknown) => void }).storeTriggeredAlert(alertData)
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith('Error storing triggered alert:', expect.any(Error))
    })
  })

  describe('Analytics Integration', () => {
    it('should track price alert events with gtag', () => {
      const mockGtag = vi.fn()
      ;(window as { gtag?: unknown }).gtag = mockGtag

      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99,
        percentageChange: -3.33
      }

      ;(service as unknown as { trackPriceAlertEvent: (action: string, data: unknown) => void }).trackPriceAlertEvent('triggered', alertData)

      expect(mockGtag).toHaveBeenCalledWith('event', 'price_alert_triggered', {
        event_category: 'price_alerts',
        event_label: 'test-product',
        value: 24.99,
        custom_parameters: {
          target_price: 25.99,
          percentage_change: -3.33
        }
      })
    })

    it('should store analytics data with size limit', () => {
      const alertData = {
        itemId: 'test-product',
        currentPrice: 24.99,
        targetPrice: 25.99
      }

      const existingAnalytics = Array.from({ length: 1000 }, (_, i) => ({
        action: 'test',
        timestamp: Date.now() - i * 1000
      }))

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingAnalytics))
      
      ;(service as unknown as { trackPriceAlertEvent: (action: string, data: unknown) => void }).trackPriceAlertEvent('triggered', alertData)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'price-alert-analytics',
        expect.stringContaining('triggered')
      )
    })
  })
})
