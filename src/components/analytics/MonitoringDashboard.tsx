import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Clock, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

interface MetricData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchMetrics = () => {
      const mockMetrics: MetricData[] = [
        {
          label: 'Page Load Time',
          value: '2.1s',
          change: '-0.3s',
          trend: 'up',
          icon: <Clock className="w-5 h-5" />
        },
        {
          label: 'Unique Visitors',
          value: '1,247',
          change: '+12%',
          trend: 'up',
          icon: <Users className="w-5 h-5" />
        },
        {
          label: 'Cart Abandonment',
          value: '68%',
          change: '-5%',
          trend: 'up',
          icon: <ShoppingCart className="w-5 h-5" />
        },
        {
          label: 'Error Rate',
          value: '0.02%',
          change: '-0.01%',
          trend: 'up',
          icon: <AlertTriangle className="w-5 h-5" />
        },
        {
          label: 'Session Duration',
          value: '3.2min',
          change: '+0.4min',
          trend: 'up',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          label: 'Bounce Rate',
          value: '42%',
          change: '-8%',
          trend: 'up',
          icon: <BarChart3 className="w-5 h-5" />
        }
      ];
      setMetrics(mockMetrics);
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const isDev = import.meta.env.MODE === 'development';
    const isAdmin = localStorage.getItem('risevia-admin') === 'true';
    setIsVisible(isDev || isAdmin);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-risevia-purple" />
        <h3 className="font-semibold text-sm">Analytics Dashboard</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
          >
            <div className="flex items-center gap-1 mb-1">
              {metric.icon}
              <span className="text-xs font-medium truncate">{metric.label}</span>
            </div>
            <div className="text-sm font-bold">{metric.value}</div>
            <div className={`text-xs ${
              metric.trend === 'up' ? 'text-green-600' : 
              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
}
