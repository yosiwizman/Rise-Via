import { describe, it, expect, vi, beforeEach } from 'vitest'
import { activityService } from '../../services/activityService'

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logActivity', () => {
    it('should log admin activity successfully', async () => {
      const activity = {
        adminId: 'admin-1',
        adminEmail: 'admin@risevia.com',
        action: 'UPDATE',
        entity: 'Product',
        entityId: '123',
        details: { field: 'price', oldValue: 45.00, newValue: 50.00 }
      }

      const result = await activityService.logActivity(activity)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(activity)
      expect(result.data?.createdAt).toBeDefined()
    })

    it('should include timestamp in activity log', async () => {
      const activity = {
        adminId: 'admin-1',
        adminEmail: 'admin@risevia.com',
        action: 'CREATE',
        entity: 'Order',
        entityId: 'RV-2024-001'
      }

      const result = await activityService.logActivity(activity)

      expect(result.success).toBe(true)
      expect(result.data?.createdAt).toBeDefined()
      expect(new Date(result.data?.createdAt || '')).toBeInstanceOf(Date)
    })

    it('should handle activity with optional details', async () => {
      const activity = {
        adminId: 'admin-1',
        adminEmail: 'admin@risevia.com',
        action: 'DELETE',
        entity: 'Product',
        entityId: '456',
        details: { productName: 'Discontinued Strain' },
        ipAddress: '192.168.1.1'
      }

      const result = await activityService.logActivity(activity)

      expect(result.success).toBe(true)
      expect(result.data?.details).toEqual(activity.details)
      expect(result.data?.ipAddress).toBe(activity.ipAddress)
    })
  })

  describe('getActivityLogs', () => {
    it('should return all activity logs without filters', async () => {
      const result = await activityService.getActivityLogs()

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('adminId')
      expect(result.data[0]).toHaveProperty('action')
      expect(result.data[0]).toHaveProperty('entity')
    })

    it('should filter activities by adminId', async () => {
      const result = await activityService.getActivityLogs({ adminId: 'admin-1' })

      expect(result.success).toBe(true)
      expect(result.data.every(log => log.adminId === 'admin-1')).toBe(true)
    })

    it('should filter activities by action', async () => {
      const result = await activityService.getActivityLogs({ action: 'UPDATE' })

      expect(result.success).toBe(true)
      expect(result.data.every(log => log.action === 'UPDATE')).toBe(true)
    })

    it('should filter activities by entity', async () => {
      const result = await activityService.getActivityLogs({ entity: 'Product' })

      expect(result.success).toBe(true)
      expect(result.data.every(log => log.entity === 'Product')).toBe(true)
    })

    it('should limit results when limit is specified', async () => {
      const result = await activityService.getActivityLogs({ limit: 1 })

      expect(result.success).toBe(true)
      expect(result.data.length).toBe(1)
    })

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 86400000).toISOString() // 1 day ago
      const endDate = new Date().toISOString()

      const result = await activityService.getActivityLogs({ 
        startDate, 
        endDate 
      })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
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
      
      expect(typeof result.data?.totalActivities).toBe('number')
      expect(typeof result.data?.todayActivities).toBe('number')
      expect(Array.isArray(result.data?.topActions)).toBe(true)
      expect(Array.isArray(result.data?.topEntities)).toBe(true)
    })

    it('should return valid action statistics', async () => {
      const result = await activityService.getActivityStats()

      expect(result.success).toBe(true)
      expect(result.data?.topActions.length).toBeGreaterThan(0)
      expect(result.data?.topActions[0]).toHaveProperty('action')
      expect(result.data?.topActions[0]).toHaveProperty('count')
    })

    it('should return valid entity statistics', async () => {
      const result = await activityService.getActivityStats()

      expect(result.success).toBe(true)
      expect(result.data?.topEntities.length).toBeGreaterThan(0)
      expect(result.data?.topEntities[0]).toHaveProperty('entity')
      expect(result.data?.topEntities[0]).toHaveProperty('count')
    })
  })
})
