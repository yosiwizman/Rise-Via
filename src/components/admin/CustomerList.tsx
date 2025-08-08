import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, Eye, User, Building } from 'lucide-react';
import { customerService } from '../../services/customerService';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
  profile?: {
    membershipTier: string;
    lifetimeValue: number;
    totalOrders: number;
    segment: string;
    isB2B: boolean;
    loyaltyPoints: number;
  };
  customer_profiles?: Array<{
    membership_tier: string;
    lifetime_value: number;
    total_orders: number;
    segment: string;
    is_b2b: boolean;
    loyalty_points: number;
  }>;
}

export const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterB2B, setFilterB2B] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      const filters = {
        segment: filterSegment,
        isB2B: filterB2B
      };
      
      const data = await customerService.search(searchTerm, filters);
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterSegment, filterB2B]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const getTierBadgeColor = (tier: string) => {
    const colors = {
      GREEN: 'bg-green-100 text-green-800',
      SILVER: 'bg-gray-100 text-gray-800', 
      GOLD: 'bg-yellow-100 text-yellow-800',
      PLATINUM: 'bg-purple-100 text-purple-800'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSegmentBadgeColor = (segment: string) => {
    const colors = {
      VIP: 'bg-purple-100 text-purple-800',
      Regular: 'bg-blue-100 text-blue-800',
      New: 'bg-green-100 text-green-800',
      Dormant: 'bg-red-100 text-red-800'
    };
    return colors[segment as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportCustomers = () => {
    const csvContent = [
      ['Name', 'Email', 'Tier', 'Segment', 'Orders', 'LTV', 'Points', 'Type'].join(','),
      ...customers.map(customer => [
        `${customer.first_name || customer.firstName} ${customer.last_name || customer.lastName}`,
        customer.email,
        customer.customer_profiles?.[0]?.membership_tier || customer.profile?.membershipTier || 'GREEN',
        customer.customer_profiles?.[0]?.segment || customer.profile?.segment || 'New',
        customer.customer_profiles?.[0]?.total_orders || customer.profile?.totalOrders || 0,
        customer.customer_profiles?.[0]?.lifetime_value || customer.profile?.lifetimeValue || 0,
        customer.customer_profiles?.[0]?.loyalty_points || customer.profile?.loyaltyPoints || 0,
        customer.customer_profiles?.[0]?.is_b2b || customer.profile?.isB2B ? 'B2B' : 'B2C'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <Button onClick={exportCustomers} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {customers.filter(c => c.customer_profiles?.[0]?.segment === 'VIP' || c.profile?.segment === 'VIP').length}
            </div>
            <div className="text-sm text-gray-600">VIP Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {customers.filter(c => c.customer_profiles?.[0]?.is_b2b || c.profile?.isB2B).length}
            </div>
            <div className="text-sm text-gray-600">B2B Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${customers.reduce((sum, c) => sum + (c.customer_profiles?.[0]?.lifetime_value || c.profile?.lifetimeValue || 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total LTV</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={filterSegment}
          onChange={(e) => setFilterSegment(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Segments</option>
          <option value="VIP">VIP</option>
          <option value="Regular">Regular</option>
          <option value="New">New</option>
          <option value="Dormant">Dormant</option>
        </select>
        <select
          value={filterB2B}
          onChange={(e) => setFilterB2B(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Types</option>
          <option value="true">B2B Only</option>
          <option value="false">B2C Only</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-left p-3">Segment</th>
                  <th className="text-left p-3">Orders</th>
                  <th className="text-left p-3">LTV</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">
                          {customer.first_name || customer.firstName} {customer.last_name || customer.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getTierBadgeColor(customer.customer_profiles?.[0]?.membership_tier || customer.profile?.membershipTier || 'GREEN')}>
                        {customer.customer_profiles?.[0]?.membership_tier || customer.profile?.membershipTier || 'GREEN'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getSegmentBadgeColor(customer.customer_profiles?.[0]?.segment || customer.profile?.segment || 'New')}>
                        {customer.customer_profiles?.[0]?.segment || customer.profile?.segment || 'New'}
                      </Badge>
                    </td>
                    <td className="p-3">{customer.customer_profiles?.[0]?.total_orders || customer.profile?.totalOrders || 0}</td>
                    <td className="p-3">${(customer.customer_profiles?.[0]?.lifetime_value || customer.profile?.lifetimeValue || 0).toFixed(2)}</td>
                    <td className="p-3">{customer.customer_profiles?.[0]?.loyalty_points || customer.profile?.loyaltyPoints || 0}</td>
                    <td className="p-3">
                      {customer.customer_profiles?.[0]?.is_b2b || customer.profile?.isB2B ? (
                        <Badge variant="outline">
                          <Building className="w-3 h-3 mr-1" />
                          B2B
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <User className="w-3 h-3 mr-1" />
                          B2C
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('View customer:', customer.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
