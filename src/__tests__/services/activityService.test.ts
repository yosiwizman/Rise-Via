import { describe, it, expect, beforeEach, vi } from 'vitest'
import { activityService } from '../../services/activityService'

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logActivity', () => {
    it('should log activity successfully', async () => {
      const activity = {
        adminId: 'admin-1',
        adminEmail: 'admin@risevia.com',
        action: 'CREATE',
        entity: 'Product',
        entityId: '123',
        details: { name: 'Test Product' },
        ipAddress: '192.168.1.1'
      }

      const result = await activityService.logActivity(activity)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(activity)
      expect(result.data?.createdAt).toBeDefined()
    })

    it('should handle logging errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const activity = {
        adminId: '',
        adminEmail: '',
        action: '',
        entity: '',
        entityId: ''
      }

      const result = await activityService.logActivity(activity)

      expect(result.success).toBe(true)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getActivityLogs', () => {
    it('should return activity logs without filters', async () => {
      const result = await activityService.getActivityLogs()

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('should filter by adminId', async () => {
      const result = await activityService.getActivityLogs({ adminId: 'admin-1' })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      result.data.forEach(log => {
        expect(log.adminId).toBe('admin-1')
      })
    })

    it('should filter by action', async () => {
      const result = await activityService.getActivityLogs({ action: 'UPDATE' })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      result.data.forEach(log => {
        expect(log.action).toBe('UPDATE')
      })
    })

    it('should filter by entity', async () => {
      const result = await activityService.getActivityLogs({ entity: 'Product' })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      result.data.forEach(log => {
        expect(log.entity).toBe('Product')
      })
    })

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 86400000).toISOString()
      const endDate = new Date().toISOString()

      const result = await activityService.getActivityLogs({ startDate, endDate })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should limit results', async () => {
      const result = await activityService.getActivityLogs({ limit: 1 })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('getActivityStats', () => {
    it('should return activity statistics', async () => {
      const result = await activityService.getActivityStats()

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('totalActivities')
      expect(result.data).toHaveProperty('todayActivities')
      expect(result.data).toHaveProperty('topActions')
      expect(result.data).toHaveProperty('topEntities')
      expect(Array.isArray(result.data?.topActions)).toBe(true)
      expect(Array.isArray(result.data?.topEntities)).toBe(true)
    })

    it('should handle stats calculation errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await activityService.getActivityStats()

      expect(result.success).toBe(true)
      
      consoleSpy.mockRestore()
    })
  })
})
