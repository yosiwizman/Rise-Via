import { describe, it, expect, vi, beforeEach } from 'vitest'
import { priceTrackingService } from '../../services/priceTracking'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('priceTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
  })

  describe('getTriggeredAlerts', () => {
    it('should return triggered alerts from localStorage', () => {
      const mockAlerts = [{
        itemId: 'test-item',
        currentPrice: 25.99,
        targetPrice: 30.00,
        triggeredAt: Date.now()
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAlerts))

      const alerts = priceTrackingService.getTriggeredAlerts()

      expect(alerts).toEqual(mockAlerts)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('risevia-price-alerts')
    })

    it('should return empty array when no alerts', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const alerts = priceTrackingService.getTriggeredAlerts()

      expect(alerts).toEqual([])
    })

    it('should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const alerts = priceTrackingService.getTriggeredAlerts()

      expect(alerts).toEqual([])
    })
  })

  describe('getPriceCheckActivity', () => {
    it('should return price check activity', () => {
      const mockActivity = [{
        timestamp: Date.now(),
        itemsChecked: 5,
        alertsTriggered: 2
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockActivity))

      const activity = priceTrackingService.getPriceCheckActivity()

      expect(activity).toEqual(mockActivity)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('price-check-activity')
    })

    it('should return empty array when no activity', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const activity = priceTrackingService.getPriceCheckActivity()

      expect(activity).toEqual([])
    })
  })

  describe('clearTriggeredAlerts', () => {
    it('should clear triggered alerts from localStorage', () => {
      priceTrackingService.clearTriggeredAlerts()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('risevia-price-alerts')
    })
  })

  describe('getAlertStats', () => {
    it('should return alert statistics', () => {
      const mockWishlistData = {
        state: {
          items: [
            {
              id: 'item-1',
              priceAlert: { isActive: true, targetPrice: 25.00 }
            },
            {
              id: 'item-2',
              priceAlert: { isActive: true, targetPrice: 30.00 }
            }
          ]
        }
      }
      const mockTriggeredAlerts = [
        { triggeredAt: Date.now() },
        { triggeredAt: Date.now() - 86400000 }
      ]

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockWishlistData))
        .mockReturnValueOnce(JSON.stringify(mockTriggeredAlerts))

      const stats = priceTrackingService.getAlertStats()

      expect(stats.totalAlerts).toBe(2)
      expect(stats.activeAlerts).toBe(2)
      expect(stats.triggeredToday).toBeGreaterThanOrEqual(0)
      expect(stats.averageResponseTime).toBeGreaterThan(0)
    })

    it('should handle empty data', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const stats = priceTrackingService.getAlertStats()

      expect(stats.totalAlerts).toBe(0)
      expect(stats.activeAlerts).toBe(0)
      expect(stats.triggeredToday).toBe(0)
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('startPriceTracking', () => {
    it('should start price tracking', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      priceTrackingService.startPriceTracking()

      expect(setIntervalSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('🔔 Price tracking service started')

      consoleSpy.mockRestore()
    })
  })

  describe('stopPriceTracking', () => {
    it('should stop price tracking', () => {
      vi.spyOn(global, 'clearInterval')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      priceTrackingService.stopPriceTracking()

      expect(consoleSpy).toHaveBeenCalledWith('🔕 Price tracking service stopped')

      consoleSpy.mockRestore()
    })
  })
})
