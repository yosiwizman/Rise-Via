import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { salesRepService } from '../../services/b2b/SalesRepService';
import { Search, Phone, Mail, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface AccountsListProps {
  repId: string;
}

export const AccountsList: React.FC<AccountsListProps> = ({ repId }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  useEffect(() => {
    loadAccounts();
  }, [repId]);

  const loadAccounts = async () => {
    if (!repId) return;
    
    setLoading(true);
    try {
      const accountsData = await salesRepService.getRepAccounts(repId);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.billing_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">My Accounts</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white">
              Add New Account
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-purple"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.company_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <a
                            href={`mailto:${account.email}`}
                            className="text-xs text-gray-500 hover:text-risevia-purple flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {account.email}
                          </a>
                          {account.phone && (
                            <a
                              href={`tel:${account.phone}`}
                              className="text-xs text-gray-500 hover:text-risevia-purple flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {account.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {account.billing_city}, {account.billing_state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {account.total_revenue ? account.total_revenue.toLocaleString() : '0'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.last_order_date ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(account.last_order_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No orders yet</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAccount(account)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-risevia-purple hover:text-risevia-purple/80"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No accounts found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
