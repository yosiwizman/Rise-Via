import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  RefreshCw,
  Target,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { revenueAnalytics, type RevenueMetrics } from '../../analytics/revenueAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral', 
  description,
  onClick 
}) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : BarChart3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`cursor-pointer ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-risevia-charcoal">
            {title}
          </CardTitle>
          <div className="text-risevia-purple">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-risevia-black">
            {value}
          </div>
          {change && (
            <p className={`text-xs ${trendColors[trend]} flex items-center mt-1`}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const RevenueAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const revenueMetrics = await revenueAnalytics.getRevenueMetrics();
      setMetrics(revenueMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load revenue metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await revenueAnalytics.exportRevenueReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-risevia-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getCurrentPeriodRevenue = () => {
    switch (selectedPeriod) {
      case 'daily': return metrics.dailyRevenue;
      case 'weekly': return metrics.weeklyRevenue;
      case 'monthly': return metrics.monthlyRevenue;
      default: return metrics.monthlyRevenue;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            Revenue Analytics Dashboard
          </h2>
          <p className="text-risevia-charcoal">
            Track sales performance, profit margins, and revenue trends
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            onClick={loadMetrics}
            variant="outline"
            size="sm"
            className="border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-2"
      >
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <Button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            className={selectedPeriod === period 
              ? "bg-gradient-to-r from-risevia-purple to-risevia-teal text-white" 
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }
          >
            <Calendar className="w-4 h-4 mr-2" />
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Revenue`}
          value={formatCurrency(getCurrentPeriodRevenue())}
          change={formatPercentage(metrics.trends.revenueGrowth)}
          trend={metrics.trends.revenueGrowth >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-4 h-4" />}
          description={`${selectedPeriod} sales performance`}
        />

        <MetricCard
          title="Average Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          change={formatPercentage(metrics.trends.avgOrderValueGrowth)}
          trend={metrics.trends.avgOrderValueGrowth >= 0 ? 'up' : 'down'}
          icon={<ShoppingBag className="w-4 h-4" />}
          description="Revenue per transaction"
        />

        <MetricCard
          title="Gross Margin"
          value={`${metrics.profitMargins.grossMargin.toFixed(1)}%`}
          change={`${formatCurrency(metrics.profitMargins.grossProfit)} profit`}
          trend="up"
          icon={<Percent className="w-4 h-4" />}
          description="Profit after cost of goods"
        />

        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={formatPercentage(metrics.trends.orderGrowth)}
          trend={metrics.trends.orderGrowth >= 0 ? 'up' : 'down'}
          icon={<Target className="w-4 h-4" />}
          description="All-time order count"
        />
      </motion.div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-risevia-black">
                <BarChart3 className="w-5 h-5 mr-2 text-risevia-purple" />
                Top Revenue Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.revenueByProduct.slice(0, 8).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-risevia-black">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-risevia-black">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full"
                          style={{
                            width: `${(product.revenue / Math.max(...metrics.revenueByProduct.map(p => p.revenue))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-risevia-black">
                <PieChart className="w-5 h-5 mr-2 text-risevia-teal" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.revenueByCategory.map((category, index) => {
                  const colors = [
                    'bg-risevia-purple',
                    'bg-risevia-teal', 
                    'bg-green-500',
                    'bg-blue-500',
                    'bg-yellow-500'
                  ];
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full mr-3`} />
                        <span className="text-risevia-charcoal capitalize font-medium">
                          {category.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-gray-100 text-gray-800">
                          {category.percentage.toFixed(1)}%
                        </Badge>
                        <span className="font-semibold text-risevia-black min-w-[80px] text-right">
                          {formatCurrency(category.revenue)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Profit Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-risevia-black">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Profit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-risevia-black">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <div className="text-sm text-risevia-charcoal">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(metrics.profitMargins.grossProfit)}
                </div>
                <div className="text-sm text-risevia-charcoal">Gross Profit</div>
                <div className="text-xs text-gray-500">
                  {metrics.profitMargins.grossMargin.toFixed(1)}% margin
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(metrics.profitMargins.netProfit)}
                </div>
                <div className="text-sm text-risevia-charcoal">Net Profit</div>
                <div className="text-xs text-gray-500">
                  {metrics.profitMargins.netMargin.toFixed(1)}% margin
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatPercentage(metrics.trends.revenueGrowth)}
                </div>
                <div className="text-sm text-risevia-charcoal">Revenue Growth</div>
                <div className="text-xs text-gray-500">30-day trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seasonal Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-risevia-black">
              <Calendar className="w-5 h-5 mr-2 text-risevia-teal" />
              Seasonal Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {metrics.seasonalData.slice(-6).map((period) => {
                const TrendIcon = period.trend === 'up' ? TrendingUp : 
                                period.trend === 'down' ? TrendingDown : BarChart3;
                const trendColor = period.trend === 'up' ? 'text-green-500' : 
                                 period.trend === 'down' ? 'text-red-500' : 'text-gray-500';
                
                return (
                  <div key={period.period} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-risevia-charcoal mb-1">
                      {period.period}
                    </div>
                    <div className="text-lg font-bold text-risevia-black">
                      {formatCurrency(period.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {period.orders} orders
                    </div>
                    <div className={`flex items-center justify-center mt-1 ${trendColor}`}>
                      <TrendIcon className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Impact Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="bg-gradient-to-r from-risevia-purple/10 to-risevia-teal/10 border-risevia-purple/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-risevia-black mb-4">
              📊 Revenue Performance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Total Revenue Generated
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {metrics.profitMargins.grossMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Average Gross Margin
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {formatPercentage(metrics.trends.revenueGrowth)}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Monthly Revenue Growth
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
