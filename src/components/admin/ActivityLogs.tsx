import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Package, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { activityService } from '../../services/activityService';

interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

const actionColors = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-gray-100 text-gray-800'
};

const entityIcons = {
  Product: <Package className="w-4 h-4" />,
  Order: <ShoppingBag className="w-4 h-4" />,
  Customer: <User className="w-4 h-4" />,
  Admin: <User className="w-4 h-4" />
};

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const result = await activityService.getActivityLogs({ limit: 100 });
      
      if (result.success && result.data) {
        setLogs(result.data as ActivityLog[]);
        setFilteredLogs(result.data as ActivityLog[]);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter(log => log.entity === entityFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(log => new Date(log.createdAt) >= startDate);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  }, [logs, actionFilter, entityFilter, dateFilter, searchTerm]);

  const getActionCounts = () => {
    return {
      all: logs.length,
      CREATE: logs.filter(log => log.action === 'CREATE').length,
      UPDATE: logs.filter(log => log.action === 'UPDATE').length,
      DELETE: logs.filter(log => log.action === 'DELETE').length,
      VIEW: logs.filter(log => log.action === 'VIEW').length
    };
  };

  const getEntityCounts = () => {
    const entities = [...new Set(logs.map(log => log.entity))];
    return entities.reduce((acc, entity) => {
      acc[entity] = logs.filter(log => log.entity === entity).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const actionCounts = getActionCounts();
  const entityCounts = getEntityCounts();

  const formatDetails = (details: Record<string, unknown>) => {
    if (!details) return null;
    
    if (typeof details === 'object') {
      return Object.entries(details).map(([key, value]) => (
        <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
          {key}: {String(value)}
        </span>
      ));
    }
    
    return <span className="text-xs bg-gray-100 px-2 py-1 rounded">{String(details)}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <div className="text-sm text-gray-500">
          {filteredLogs.length} of {logs.length} activities
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => {
                const today = new Date().toDateString();
                return new Date(log.createdAt).toDateString() === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Common Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(actionCounts)
                .filter(([key]) => key !== 'all')
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(actionCounts)
                .filter(([key]) => key !== 'all')
                .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} times
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Active Entity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(entityCounts)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(entityCounts)
                .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} activities
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search by admin email, entity ID, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="VIEW">View</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {Object.keys(entityCounts).map(entity => (
              <SelectItem key={entity} value={entity}>{entity}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  {entityIcons[log.entity as keyof typeof entityIcons] || <Package className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={actionColors[log.action as keyof typeof actionColors] || actionColors.VIEW}>
                      {log.action}
                    </Badge>
                    <span className="text-sm font-medium">{log.entity}</span>
                    <span className="text-sm text-gray-500">#{log.entityId}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    by <span className="font-medium">{log.adminEmail}</span>
                    {log.ipAddress && <span className="ml-2">from {log.ipAddress}</span>}
                  </div>
                  
                  {log.details && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {formatDetails(log.details)}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activity logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
