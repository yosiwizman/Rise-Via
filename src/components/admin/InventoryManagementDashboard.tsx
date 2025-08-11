import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Truck,
  BarChart3,
  Download,
  RefreshCw,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { inventoryManagement, type InventoryAnalytics } from '../../analytics/inventoryManagement';

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

export const InventoryManagementDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const transactions = JSON.parse(localStorage.getItem('risevia_transactions') || '[]');
      const inventoryAnalytics = inventoryManagement.getInventoryAnalytics(transactions);
      setAnalytics(inventoryAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load inventory analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    try {
      const report = JSON.stringify({
        generatedAt: new Date().toISOString(),
        analytics,
        inventoryItems: JSON.parse(localStorage.getItem('risevia_inventory') || '[]')
      }, null, 2);
      
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-management-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
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

  const getUrgencyColor = (urgency: 'immediate' | 'soon' | 'planned') => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'soon': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredCategoryPerformance = selectedCategory === 'all' 
    ? analytics.categoryPerformance 
    : analytics.categoryPerformance.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            Inventory Management Dashboard
          </h2>
          <p className="text-risevia-charcoal">
            Monitor stock levels, predict demand, and optimize inventory operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            onClick={loadAnalytics}
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Products"
          value={analytics.totalProducts.toLocaleString()}
          change={`${analytics.lowStockAlerts.length} low stock alerts`}
          trend={analytics.lowStockAlerts.length > 0 ? 'down' : 'up'}
          icon={<Package className="w-4 h-4" />}
          description="Active inventory items"
        />

        <MetricCard
          title="Total Stock Value"
          value={formatCurrency(analytics.totalStockValue)}
          change="Inventory investment"
          trend="neutral"
          icon={<DollarSign className="w-4 h-4" />}
          description="Current inventory value"
        />

        <MetricCard
          title="Average Turnover Rate"
          value={`${(typeof analytics.averageTurnoverRate === 'number' ? analytics.averageTurnoverRate : parseFloat(analytics.averageTurnoverRate) || 0).toFixed(1)}x`}
          change="Annual inventory turns"
          trend={analytics.averageTurnoverRate > 6 ? 'up' : 'down'}
          icon={<Zap className="w-4 h-4" />}
          description="Inventory efficiency"
        />

        <MetricCard
          title="Stockout Risks"
          value={analytics.stockoutRisks.length}
          change={`${analytics.reorderRecommendations.filter(r => r.urgency === 'immediate').length} immediate`}
          trend={analytics.stockoutRisks.length > 0 ? 'down' : 'up'}
          icon={<AlertTriangle className="w-4 h-4" />}
          description="Items at risk"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-risevia-black">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.lowStockAlerts.slice(0, 8).map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <div className="text-red-500 mr-3">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-risevia-black">{item.productName}</div>
                        <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {item.currentStock} units
                      </div>
                      <div className="text-xs text-gray-500">
                        Reorder at {item.reorderPoint}
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.lowStockAlerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No low stock alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-risevia-black">
                <Truck className="w-5 h-5 mr-2 text-risevia-teal" />
                Reorder Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.reorderRecommendations.slice(0, 8).map((recommendation) => (
                  <div key={recommendation.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-risevia-teal mr-3">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-risevia-black">{recommendation.productName}</div>
                        <div className="text-sm text-gray-500">
                          Current: {recommendation.currentStock} units
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getUrgencyColor(recommendation.urgency)}>
                        {recommendation.urgency}
                      </Badge>
                      <div className="text-sm font-semibold text-risevia-black mt-1">
                        Order {recommendation.recommendedOrder} units
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.reorderRecommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No reorder recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-risevia-black">
              <BarChart3 className="w-5 h-5 mr-2 text-risevia-purple" />
              Supplier Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.supplierPerformance.map((supplier) => (
                <div key={supplier.supplier} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-risevia-black">{supplier.supplier}</h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {supplier.totalProducts} products
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lead Time:</span>
                      <span className="font-medium">{(typeof supplier.averageLeadTime === 'number' ? supplier.averageLeadTime : parseFloat(supplier.averageLeadTime) || 0).toFixed(1)} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reliability:</span>
                      <span className={`font-medium ${supplier.reliability > 80 ? 'text-green-600' : supplier.reliability > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {(typeof supplier.reliability === 'number' ? supplier.reliability : parseFloat(supplier.reliability) || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${supplier.reliability > 80 ? 'bg-green-500' : supplier.reliability > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${supplier.reliability}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-risevia-black">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Category Performance
              </CardTitle>
              <div className="flex space-x-2">
                {['all', ...analytics.categoryPerformance.map(c => c.category)].map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === category 
                      ? "bg-gradient-to-r from-risevia-purple to-risevia-teal text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }
                  >
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCategoryPerformance.map((category) => (
                <div key={category.category} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-risevia-black capitalize">{category.category}</h4>
                    <div className="text-sm text-gray-500">
                      {(typeof category.turnoverRate === 'number' ? category.turnoverRate : parseFloat(category.turnoverRate) || 0).toFixed(1)}x turnover
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Stock Value:</span>
                        <span className="font-medium">{formatCurrency(category.stockValue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full"
                          style={{ 
                            width: `${(category.stockValue / Math.max(...analytics.categoryPerformance.map(c => c.stockValue))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Profit Margin:</span>
                        <span className={`font-medium ${category.profitMargin > 30 ? 'text-green-600' : category.profitMargin > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {(typeof category.profitMargin === 'number' ? category.profitMargin : parseFloat(category.profitMargin) || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.profitMargin > 30 ? 'bg-green-500' : category.profitMargin > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(category.profitMargin, 50)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="bg-gradient-to-r from-risevia-purple/10 to-risevia-teal/10 border-risevia-purple/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-risevia-black mb-4">
              📦 Inventory Management Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {formatCurrency(analytics.totalStockValue)}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Total Inventory Value
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {analytics.averageTurnoverRate.toFixed(1)}x
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Average Turnover Rate
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {analytics.reorderRecommendations.length}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Reorder Recommendations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
