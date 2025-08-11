
interface ActivityLog {
  id?: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
}

export const activityService = {
  async logActivity(activity: Omit<ActivityLog, 'id' | 'createdAt'>) {
    try {
      const activityData = {
        ...activity,
        createdAt: new Date().toISOString()
      };

      console.log('Activity logged:', activityData);
      
      return { success: true, data: activityData };
    } catch (error) {
      console.error('Failed to log activity:', error);
      return { success: false, error };
    }
  },

  async getActivityLogs(filters?: {
    adminId?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    try {
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          adminId: 'admin-1',
          adminEmail: 'admin@risevia.com',
          action: 'UPDATE',
          entity: 'Product',
          entityId: '1',
          details: { field: 'price', oldValue: 45.00, newValue: 50.00 },
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          adminId: 'admin-1',
          adminEmail: 'admin@risevia.com',
          action: 'CREATE',
          entity: 'Order',
          entityId: 'RV-2024-001',
          details: { customerEmail: 'john@example.com', total: 89.99 },
          ipAddress: '192.168.1.1',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          adminId: 'admin-1',
          adminEmail: 'admin@risevia.com',
          action: 'DELETE',
          entity: 'Product',
          entityId: '5',
          details: { productName: 'Discontinued Strain' },
          ipAddress: '192.168.1.1',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      let filteredLogs = mockLogs;

      if (filters?.adminId) {
        filteredLogs = filteredLogs.filter(log => log.adminId === filters.adminId);
      }

      if (filters?.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }

      if (filters?.entity) {
        filteredLogs = filteredLogs.filter(log => log.entity === filters.entity);
      }

      if (filters?.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt!) >= new Date(filters.startDate!)
        );
      }

      if (filters?.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt!) <= new Date(filters.endDate!)
        );
      }

      if (filters?.limit) {
        if (!Array.isArray(filteredLogs)) {
          console.warn('⚠️ activityService.getActivityLogs: filteredLogs is not an array:', typeof filteredLogs, filteredLogs);
          filteredLogs = [];
        }
        try {
          filteredLogs = filteredLogs.slice(0, filters.limit);
        } catch (error) {
          console.error('❌ Error in activityService slice operation:', error, 'filteredLogs:', filteredLogs);
          filteredLogs = [];
        }
      }

      return { success: true, data: filteredLogs };
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return { success: false, error, data: [] };
    }
  },

  async getActivityStats() {
    try {
      const mockStats = {
        totalActivities: 156,
        todayActivities: 12,
        topActions: [
          { action: 'UPDATE', count: 45 },
          { action: 'CREATE', count: 32 },
          { action: 'DELETE', count: 8 }
        ],
        topEntities: [
          { entity: 'Product', count: 67 },
          { entity: 'Order', count: 43 },
          { entity: 'Customer', count: 28 }
        ]
      };

      return { success: true, data: mockStats };
    } catch (error) {
      console.error('Failed to get activity stats:', error);
      return { success: false, error };
    }
  }
};
