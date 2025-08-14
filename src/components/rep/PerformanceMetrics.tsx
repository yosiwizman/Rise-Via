import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { salesRepService, type RepPerformanceMetrics } from '../../services/b2b/SalesRepService';
import { TrendingUp, Users, DollarSign, Target, Award, Activity } from 'lucide-react';
import { Progress } from '../ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PerformanceMetricsProps {
  repId: string;
  period: 'month' | 'quarter' | 'year';
  onPeriodChange: (period: 'month' | 'quarter' | 'year') => void;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  repId,
  period,
  onPeriodChange
}) => {
  const [metrics, setMetrics] = useState<RepPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [repId, period]);

  const loadMetrics = async () => {
    if (!repId) return;
    
    setLoading(true);
    try {
      const metricsData = await salesRepService.getRepPerformanceMetrics(repId);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const salesTrendData = [
    { month: 'Jan', sales: 45000, target: 50000 },
    { month: 'Feb', sales: 52000, target: 50000 },
    { month: 'Mar', sales: 48000, target: 50000 },
    { month: 'Apr', sales: 61000, target: 55000 },
    { month: 'May', sales: 58000, target: 55000 },
    { month: 'Jun', sales: 67000, target: 60000 },
  ];

  const categoryData = [
    { name: 'Flower', value: 35, color: '#8b5cf6' },
    { name: 'Vapes', value: 25, color: '#06b6d4' },
    { name: 'Edibles', value: 20, color: '#10b981' },
    { name: 'Concentrates', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#6b7280' },
  ];

  const performanceCards = [
    {
      title: 'Quota Attainment',
      value: `${Math.round(metrics?.quota_attainment || 0)}%`,
      target: '100%',
      icon: <Target className="w-5 h-5" />,
      progress: metrics?.quota_attainment || 0
    },
    {
      title: 'Customer Retention',
      value: `${Math.round(metrics?.customer_retention_rate || 85)}%`,
      target: '90%',
      icon: <Users className="w-5 h-5" />,
      progress: metrics?.customer_retention_rate || 85
    },
    {
      title: 'Avg Order Value',
      value: `$${Math.round(metrics?.average_order_value || 0)}`,
      target: '$500',
      icon: <DollarSign className="w-5 h-5" />,
      progress: ((metrics?.average_order_value || 0) / 500) * 100
    },
    {
      title: 'New Accounts',
      value: metrics?.new_accounts_this_month || 0,
      target: '10',
      icon: <Award className="w-5 h-5" />,
      progress: ((metrics?.new_accounts_this_month || 0) / 10) * 100
    }
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Metrics</h2>
        <Select value={period} onValueChange={(value: any) => onPeriodChange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-purple"></div>
        </div>
      ) : (
        <>
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceCards.map((card) => (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-risevia-purple/10 rounded-lg">
                      {card.icon}
                    </div>
                    <span className="text-sm text-gray-500">Target: {card.target}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <Progress value={Math.min(card.progress, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Actual Sales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#06b6d4" 
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Top Performer</p>
                      <p className="text-sm text-gray-500">Exceeded monthly quota by 20%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Customer Champion</p>
                      <p className="text-sm text-gray-500">Highest retention rate in team</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">New Account Leader</p>
                      <p className="text-sm text-gray-500">Most new accounts this quarter</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
