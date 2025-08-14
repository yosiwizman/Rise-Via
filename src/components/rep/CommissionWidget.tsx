import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { salesRepService, type CommissionTransaction } from '../../services/b2b/SalesRepService';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommissionWidgetProps {
  repId: string;
}

export const CommissionWidget: React.FC<CommissionWidgetProps> = ({ repId }) => {
  const [commissions, setCommissions] = useState<{
    pending: number;
    approved: number;
    paid: number;
    total: number;
  }>({
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissionData();
  }, [repId]);

  const loadCommissionData = async () => {
    if (!repId) return;
    
    setLoading(true);
    try {
      const metrics = await salesRepService.getRepPerformanceMetrics(repId);
      setCommissions({
        pending: metrics.pending_commissions,
        approved: 0, // Would need separate query
        paid: metrics.paid_commissions,
        total: metrics.total_commissions
      });

      // Load recent transactions (would need to add this method to service)
      // const transactions = await salesRepService.getRecentCommissionTransactions(repId, 5);
      // setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const commissionCards = [
    {
      title: 'Pending',
      amount: commissions.pending,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Approved',
      amount: commissions.approved,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Paid (YTD)',
      amount: commissions.paid,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Earned',
      amount: commissions.total,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Commission Overview</CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Current Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-purple"></div>
          </div>
        ) : (
          <>
            {/* Commission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {commissionCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <div className={card.color}>{card.icon}</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${card.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Commission Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Target Progress
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  75%
                </span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                $7,500 of $10,000 target achieved
              </p>
            </div>

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Recent Transactions
                </h3>
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          +${transaction.commission_amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal text-white">
                Download Statement
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
