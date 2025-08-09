import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, AlertCircle, Users, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface DashboardMetricsData {
  todaySales: number;
  todayOrders: number;
  totalCustomers: number;
  lowStockProducts: Array<{ id: string; name: string; inventory: number }>;
  pendingOrders: number;
  activeProducts: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className={`cursor-pointer ${onClick ? 'hover:shadow-lg' : ''}`}
    onClick={onClick}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-muted-foreground'
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const DashboardMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    todaySales: 0,
    todayOrders: 0,
    totalCustomers: 0,
    lowStockProducts: [],
    pendingOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      
      const mockMetrics: DashboardMetricsData = {
        todaySales: Math.floor(Math.random() * 5000) + 1000,
        todayOrders: Math.floor(Math.random() * 50) + 10,
        totalCustomers: Math.floor(Math.random() * 1000) + 500,
        lowStockProducts: [
          { id: '1', name: 'Blue Dream', inventory: 5 },
          { id: '2', name: 'OG Kush', inventory: 3 }
        ],
        pendingOrders: Math.floor(Math.random() * 20) + 5,
        activeProducts: 15,
        totalRevenue: Math.floor(Math.random() * 50000) + 25000,
        averageOrderValue: Math.floor(Math.random() * 100) + 80
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && metrics.todaySales === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {loading && <span className="ml-2 animate-pulse">Updating...</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Sales"
          value={`$${metrics.todaySales.toLocaleString()}`}
          change="+12% from yesterday"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        
        <MetricCard
          title="Orders Today"
          value={metrics.todayOrders}
          change={`${metrics.pendingOrders} pending`}
          icon={<ShoppingBag className="h-4 w-4" />}
          trend="up"
        />
        
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          change="+5% this month"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        
        <MetricCard
          title="Low Stock Alert"
          value={metrics.lowStockProducts.length}
          change={metrics.lowStockProducts.length > 0 ? "Needs attention" : "All good"}
          icon={<AlertCircle className="h-4 w-4" />}
          trend={metrics.lowStockProducts.length > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Products"
          value={metrics.activeProducts}
          change="15 total strains"
          icon={<Package className="h-4 w-4" />}
          trend="neutral"
        />
        
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change="+18% this month"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        
        <MetricCard
          title="Avg Order Value"
          value={`$${metrics.averageOrderValue}`}
          change="+$5 from last month"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders}
          change="Requires processing"
          icon={<ShoppingBag className="h-4 w-4" />}
          trend={metrics.pendingOrders > 10 ? "down" : "neutral"}
        />
      </div>

      {metrics.lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
          </div>
          <div className="space-y-2">
            {metrics.lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                <span className="text-red-700">{product.name}</span>
                <span className="text-red-600 font-medium">{product.inventory} units left</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
