import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Heart,
  AlertTriangle,
  Target,
  DollarSign,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Crown,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { customerIntelligence, type CustomerIntelligenceAnalytics } from '../../analytics/customerIntelligence';

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

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Target;

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

export const CustomerIntelligenceDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CustomerIntelligenceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const transactions = JSON.parse(localStorage.getItem('risevia_transactions') || '[]');
      const customerAnalytics = customerIntelligence.getCustomerIntelligenceAnalytics(transactions);
      setAnalytics(customerAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load customer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    try {
      const retentionReport = customerIntelligence.generateCustomerRetentionReport();
      const report = JSON.stringify({
        generatedAt: new Date().toISOString(),
        analytics,
        retentionReport
      }, null, 2);
      
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
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

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'at_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'churned': return <UserX className="w-4 h-4" />;
      case 'new': return <UserCheck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'churned': return 'bg-gray-100 text-gray-800';
      case 'new': return 'bg-green-100 text-green-800';
      case 'regular': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChurnRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
    }
  };

  const filteredCustomers = selectedSegment === 'all' 
    ? analytics.topCustomers 
    : analytics.topCustomers.filter(c => c.segment === selectedSegment);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            Customer Intelligence Dashboard
          </h2>
          <p className="text-risevia-charcoal">
            Analyze customer lifetime value, churn risk, and retention metrics
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
          title="Total Customers"
          value={analytics.totalCustomers.toLocaleString()}
          change={`${(typeof analytics.newCustomerRate === 'number' ? analytics.newCustomerRate : parseFloat(analytics.newCustomerRate) || 0).toFixed(1)}% new this month`}
          trend="up"
          icon={<Users className="w-4 h-4" />}
          description="Active customer base"
        />

        <MetricCard
          title="Average Lifetime Value"
          value={formatCurrency(analytics.averageLifetimeValue)}
          change="Revenue per customer"
          trend="neutral"
          icon={<DollarSign className="w-4 h-4" />}
          description="Total customer value"
        />

        <MetricCard
          title="Retention Rate"
          value={`${(typeof analytics.retentionRate === 'number' ? analytics.retentionRate : parseFloat(analytics.retentionRate) || 0).toFixed(1)}%`}
          change="Active customers"
          trend={analytics.retentionRate > 70 ? 'up' : 'down'}
          icon={<Heart className="w-4 h-4" />}
          description="Customer retention"
        />

        <MetricCard
          title="Churn Rate"
          value={`${(typeof analytics.churnRate === 'number' ? analytics.churnRate : parseFloat(analytics.churnRate) || 0).toFixed(1)}%`}
          change="Lost customers"
          trend={analytics.churnRate < 20 ? 'up' : 'down'}
          icon={<UserX className="w-4 h-4" />}
          description="Customer churn"
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
                <Users className="w-5 h-5 mr-2 text-risevia-purple" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.customerSegments.map((segment) => (
                  <div key={segment.segment} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-risevia-purple mr-3">
                        {getSegmentIcon(segment.segment)}
                      </div>
                      <div>
                        <div className="font-medium text-risevia-black capitalize">
                          {segment.segment.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {segment.count} customers
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getSegmentColor(segment.segment)}>
                        {(typeof segment.percentage === 'number' ? segment.percentage : parseFloat(segment.percentage) || 0).toFixed(1)}%
                      </Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-risevia-black">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Churn Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3" />
                    <span className="text-risevia-charcoal font-medium">High Risk</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-risevia-black">
                      {analytics.churnRiskDistribution.high}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ 
                          width: `${(analytics.churnRiskDistribution.high / analytics.totalCustomers) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3" />
                    <span className="text-risevia-charcoal font-medium">Medium Risk</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-risevia-black">
                      {analytics.churnRiskDistribution.medium}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ 
                          width: `${(analytics.churnRiskDistribution.medium / analytics.totalCustomers) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                    <span className="text-risevia-charcoal font-medium">Low Risk</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-risevia-black">
                      {analytics.churnRiskDistribution.low}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(analytics.churnRiskDistribution.low / analytics.totalCustomers) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-risevia-black">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Top Customers by Lifetime Value
              </CardTitle>
              <div className="flex space-x-2">
                {['all', 'vip', 'regular', 'at_risk'].map((segment) => (
                  <Button
                    key={segment}
                    onClick={() => setSelectedSegment(segment)}
                    variant={selectedSegment === segment ? "default" : "outline"}
                    size="sm"
                    className={selectedSegment === segment 
                      ? "bg-gradient-to-r from-risevia-purple to-risevia-teal text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }
                  >
                    {segment === 'all' ? 'All' : (segment && typeof segment === 'string' ? segment.charAt(0).toUpperCase() + segment.slice(1).replace('_', ' ') : '')}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(filteredCustomers && Array.isArray(filteredCustomers) ? filteredCustomers.slice(0, 10) : []).map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-risevia-black">
                        Customer {customer.customerId}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge className={getSegmentColor(customer.segment)}>
                          {customer.segment.replace('_', ' ')}
                        </Badge>
                        <span className={getChurnRiskColor(customer.churnRisk)}>
                          {customer.churnRisk} risk
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-risevia-black">
                      {formatCurrency(customer.lifetimeValue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.totalOrders} orders • {formatCurrency(customer.averageOrderValue)} avg
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
            <CardTitle className="flex items-center text-risevia-black">
              <Mail className="w-5 h-5 mr-2 text-risevia-teal" />
              Reactivation Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(analytics.reactivationOpportunities && Array.isArray(analytics.reactivationOpportunities) ? analytics.reactivationOpportunities.slice(0, 6) : []).map((customer) => (
                <div key={customer.customerId} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-risevia-black">
                      Customer {customer.customerId}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {customer.daysSinceLastPurchase} days
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    LTV: {formatCurrency(customer.lifetimeValue)}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Last order: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
                  >
                    Send Reactivation Email
                  </Button>
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
              🎯 Customer Intelligence Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {formatCurrency(analytics.averageLifetimeValue)}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Average Customer Value
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {(typeof analytics.retentionRate === 'number' ? analytics.retentionRate : parseFloat(analytics.retentionRate) || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Customer Retention Rate
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {analytics.reactivationOpportunities.length}
                </div>
                <div className="text-sm text-risevia-charcoal">
                  Reactivation Opportunities
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
