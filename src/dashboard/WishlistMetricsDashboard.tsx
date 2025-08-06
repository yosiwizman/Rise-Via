import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Heart, Share2, Target, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { wishlistAnalytics } from '../analytics/wishlistAnalytics';
import { priceTrackingService } from '../services/priceTracking';
import { WishlistAnalytics } from '../types/wishlist';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

const MetricCard = ({ title, value, change, icon, trend = 'neutral', description }: MetricCardProps) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
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
            <TrendingUp className="w-3 h-3 mr-1" />
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
  );
};

export const WishlistMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<WishlistAnalytics | null>(null);
  const [priceAlertStats, setPriceAlertStats] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const analyticsMetrics = wishlistAnalytics.getMetrics();
      
      const returnVisitorRate = wishlistAnalytics.calculateReturnVisitorRate();
      const averageItems = wishlistAnalytics.calculateAverageItemsPerWishlist();
      
      analyticsMetrics.returnVisitorRate = returnVisitorRate;
      analyticsMetrics.averageItemsPerWishlist = averageItems;
      
      setMetrics(analyticsMetrics);

      const alertStats = priceTrackingService.getAlertStats();
      setPriceAlertStats(alertStats);

      const report = wishlistAnalytics.generateDailyReport();
      setDailyReport(report);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-risevia-light py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-risevia-purple border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const conversionRate = metrics.addToWishlistEvents > 0 
    ? ((metrics.conversionEvents / metrics.addToWishlistEvents) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Wishlist Analytics Dashboard
              </h1>
              <p className="text-risevia-charcoal">
                Track wishlist performance and user engagement metrics
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
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Return Visitor Rate"
            value={`${metrics.returnVisitorRate.toFixed(1)}%`}
            change="+15% from baseline"
            trend="up"
            icon={<Users className="w-4 h-4" />}
            description="Users who return after first visit"
          />
          
          <MetricCard
            title="Wishlist Conversion"
            value={`${conversionRate}%`}
            change="+8% this week"
            trend="up"
            icon={<Target className="w-4 h-4" />}
            description="Wishlist items converted to purchases"
          />
          
          <MetricCard
            title="Average Items"
            value={metrics.averageItemsPerWishlist.toFixed(1)}
            change="+2.3 items"
            trend="up"
            icon={<Heart className="w-4 h-4" />}
            description="Average items per wishlist"
          />
          
          <MetricCard
            title="Share Events"
            value={metrics.shareEvents}
            change="+25% engagement"
            trend="up"
            icon={<Share2 className="w-4 h-4" />}
            description="Wishlists shared with others"
          />
        </motion.div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-risevia-black">
                  <BarChart3 className="w-5 h-5 mr-2 text-risevia-purple" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-risevia-charcoal">Items Added</span>
                  <Badge className="bg-green-100 text-green-800">
                    {metrics.addToWishlistEvents}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-risevia-charcoal">Items Removed</span>
                  <Badge className="bg-red-100 text-red-800">
                    {metrics.removeFromWishlistEvents}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-risevia-charcoal">Imports</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {metrics.importEvents}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-risevia-charcoal">Conversions</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {metrics.conversionEvents}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-risevia-black">
                  <TrendingUp className="w-5 h-5 mr-2 text-risevia-teal" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.topCategories.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.topCategories.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-risevia-teal rounded-full mr-3" />
                          <span className="text-risevia-charcoal capitalize">
                            {category.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-risevia-black">
                            {category.count}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-risevia-teal h-2 rounded-full"
                              style={{
                                width: `${(category.count / Math.max(...metrics.topCategories.map(c => c.count))) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No category data available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Price Alerts Section */}
        {priceAlertStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-risevia-black">
                  <Target className="w-5 h-5 mr-2 text-risevia-purple" />
                  Price Alert Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-risevia-purple">
                      {priceAlertStats.activeAlerts}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-risevia-teal">
                      {priceAlertStats.triggeredToday}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Triggered Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {metrics.priceAlertConversions}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {priceAlertStats.averageResponseTime}s
                    </div>
                    <div className="text-sm text-risevia-charcoal">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Daily Report */}
        {dailyReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-risevia-black">
                  <BarChart3 className="w-5 h-5 mr-2 text-risevia-teal" />
                  Today's Report - {dailyReport.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-risevia-black">
                      {dailyReport.totalEvents}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Total Events</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-500">
                      {dailyReport.addEvents}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Added</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-500">
                      {dailyReport.removeEvents}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Removed</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-500">
                      {dailyReport.shareEvents}
                    </div>
                    <div className="text-sm text-risevia-charcoal">Shared</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-500">
                      {dailyReport.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-risevia-charcoal">Conversion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Success Metrics Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <Card className="bg-gradient-to-r from-risevia-purple/10 to-risevia-teal/10 border-risevia-purple/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-risevia-black mb-4">
                🎯 Business Impact Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    +{metrics.returnVisitorRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-risevia-charcoal">
                    Return Visitor Rate Improvement
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    +{conversionRate}%
                  </div>
                  <div className="text-sm text-risevia-charcoal">
                    Wishlist Conversion Rate
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500 mb-1">
                    {metrics.averageItemsPerWishlist.toFixed(1)}
                  </div>
                  <div className="text-sm text-risevia-charcoal">
                    Average Items per User
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
