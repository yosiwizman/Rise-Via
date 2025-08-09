import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { priceTrackingService } from '../../services/priceTracking'

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

const mockNotification = {
  permission: 'granted' as NotificationPermission,
  requestPermission: vi.fn(() => Promise.resolve('granted' as NotificationPermission))
}

Object.defineProperty(window, 'Notification', {
  value: vi.fn().mockImplementation((title, options) => ({
    title,
    ...options
  })),
  configurable: true
})

Object.defineProperty(window.Notification, 'permission', {
  value: mockNotification.permission,
  configurable: true
})

Object.defineProperty(window.Notification, 'requestPermission', {
  value: mockNotification.requestPermission,
  configurable: true
})

describe('priceTrackingService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('startPriceTracking', () => {
    it('should start price tracking interval', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      priceTrackingService.startPriceTracking()

      expect(consoleSpy).toHaveBeenCalledWith('🔔 Price tracking service started')
      
      consoleSpy.mockRestore()
    })
  })

  describe('stopPriceTracking', () => {
    it('should stop price tracking interval', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      priceTrackingService.startPriceTracking()
      priceTrackingService.stopPriceTracking()

      expect(consoleSpy).toHaveBeenCalledWith('🔕 Price tracking service stopped')
      
      consoleSpy.mockRestore()
    })
  })

  describe('getTriggeredAlerts', () => {
    it('should return empty array when no alerts', () => {
      const alerts = priceTrackingService.getTriggeredAlerts()

      expect(alerts).toEqual([])
    })

    it('should return stored alerts', () => {
      const testAlerts = [
        {
          itemId: 'test-1',
          currentPrice: 25.99,
          targetPrice: 30.00,
          triggeredAt: Date.now()
        }
      ]

      mockLocalStorage.setItem('risevia-price-alerts', JSON.stringify(testAlerts))

      const alerts = priceTrackingService.getTriggeredAlerts()

      expect(alerts).toEqual(testAlerts)
    })
  })

  describe('clearTriggeredAlerts', () => {
    it('should clear all triggered alerts', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      priceTrackingService.clearTriggeredAlerts()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('risevia-price-alerts')
      expect(consoleSpy).toHaveBeenCalledWith('🗑️ Cleared all triggered price alerts')
      
      consoleSpy.mockRestore()
    })
  })

  describe('getAlertStats', () => {
    it('should return default stats when no data', () => {
      const stats = priceTrackingService.getAlertStats()

      expect(stats).toEqual({
        totalAlerts: 0,
        activeAlerts: 0,
        triggeredToday: 0,
        averageResponseTime: 300
      })
    })

    it('should calculate stats from stored data', () => {
      const wishlistData = {
        state: {
          items: [
            {
              id: '1',
              priceAlert: { isActive: true, targetPrice: 25.00 }
            },
            {
              id: '2',
              priceAlert: { isActive: false, targetPrice: 30.00 }
            }
          ]
        }
      }

      const triggeredAlerts = [
        { triggeredAt: Date.now() },
        { triggeredAt: Date.now() - 86400000 }
      ]

      mockLocalStorage.setItem('risevia-wishlist', JSON.stringify(wishlistData))
      mockLocalStorage.setItem('risevia-price-alerts', JSON.stringify(triggeredAlerts))

      const stats = priceTrackingService.getAlertStats()

      expect(stats.activeAlerts).toBe(1)
      expect(stats.totalAlerts).toBe(2)
      expect(stats.triggeredToday).toBe(1)
    })
  })

  describe('getPriceCheckActivity', () => {
    it('should return empty array when no activity', () => {
      const activity = priceTrackingService.getPriceCheckActivity()

      expect(activity).toEqual([])
    })

    it('should return stored activity', () => {
      const testActivity = [
        {
          timestamp: Date.now(),
          itemsChecked: 5,
          alertsTriggered: 1
        }
      ]

      mockLocalStorage.setItem('price-check-activity', JSON.stringify(testActivity))

      const activity = priceTrackingService.getPriceCheckActivity()

      expect(activity).toEqual(testActivity)
    })
  })
})
