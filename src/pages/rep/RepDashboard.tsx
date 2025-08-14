import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CommissionWidget } from '../../components/rep/CommissionWidget';
import { AccountsList } from '../../components/rep/AccountsList';
import { PerformanceMetrics } from '../../components/rep/PerformanceMetrics';
import { CommissionHistory } from '../../components/rep/CommissionHistory';
import { salesRepService, type RepPerformanceMetrics } from '../../services/b2b/SalesRepService';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Users, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const RepDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RepPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const period = getPeriodDates(selectedPeriod);
      const metricsData = await salesRepService.getRepPerformanceMetrics(user.id, period);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDates = (period: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  const quickStats = [
    {
      title: 'Total Sales',
      value: `$${metrics?.total_sales.toLocaleString() || '0'}`,
      icon: <DollarSign className="w-5 h-5" />,
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Active Accounts',
      value: metrics?.account_count || 0,
      icon: <Users className="w-5 h-5" />,
      change: `+${metrics?.new_accounts_this_month || 0} this month`,
      trend: 'up'
    },
    {
      title: 'Quota Attainment',
      value: `${Math.round(metrics?.quota_attainment || 0)}%`,
      icon: <Target className="w-5 h-5" />,
      change: metrics?.quota_attainment >= 100 ? 'On Track' : 'Below Target',
      trend: metrics?.quota_attainment >= 100 ? 'up' : 'down'
    },
    {
      title: 'Avg Order Value',
      value: `$${Math.round(metrics?.average_order_value || 0)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: '+8.3%',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Sales Rep Dashboard - RiseViA"
        description="Manage your accounts, track commissions, and monitor performance"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sales Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.first_name}! Here's your performance overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-risevia-purple/10 rounded-lg">
                      {stat.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Commission Widget */}
        <div className="mb-8">
          <CommissionWidget repId={user?.id || ''} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <AccountsList repId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics 
              repId={user?.id || ''} 
              period={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <CommissionHistory repId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Monthly Sales Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Commission Statement
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Account Activity Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Performance Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepDashboard;
