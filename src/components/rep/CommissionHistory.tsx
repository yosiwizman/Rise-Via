import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { salesRepService, type CommissionTransaction } from '../../services/b2b/SalesRepService';
import { Download, Filter, Search, Calendar, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CommissionHistoryProps {
  repId: string;
}

export const CommissionHistory: React.FC<CommissionHistoryProps> = ({ repId }) => {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, [repId, filter, selectedPeriod]);

  const loadTransactions = async () => {
    if (!repId) return;
    
    setLoading(true);
    try {
      // This would need to be implemented in the service
      // const transactionsData = await salesRepService.getCommissionTransactions(repId, filter, selectedPeriod);
      // setTransactions(transactionsData);
      
      // Mock data for now
      setTransactions([
        {
          id: '1',
          rep_id: repId,
          order_id: 'ORD-001',
          business_account_id: 'BUS-001',
          type: 'sale',
          description: 'Commission for Order #ORD-001',
          order_amount: 5000,
          commissionable_amount: 5000,
          commission_rate: 7,
          commission_amount: 350,
          status: 'paid',
          sale_date: '2024-01-15',
          commission_period: '2024-01',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          rep_id: repId,
          order_id: 'ORD-002',
          business_account_id: 'BUS-002',
          type: 'bonus',
          description: 'New customer bonus',
          order_amount: 3000,
          commissionable_amount: 3000,
          commission_rate: 2,
          commission_amount: 60,
          status: 'approved',
          sale_date: '2024-01-20',
          commission_period: '2024-01',
          created_at: '2024-01-20T14:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error loading commission transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Paid' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'bonus':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'override':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.status !== filter) return false;
    if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.commission_amount, 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Commission History</CardTitle>
          <Button className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full md:w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Time</SelectItem>
              <SelectItem value="2024-01">Jan 2024</SelectItem>
              <SelectItem value="2023-12">Dec 2023</SelectItem>
              <SelectItem value="2023-11">Nov 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredTransactions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-purple"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{transaction.description}</p>
                      {transaction.order_id && (
                        <p className="text-xs text-gray-500">Order: {transaction.order_id}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      ${transaction.order_amount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      {transaction.commission_rate}%
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${transaction.commission_amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
