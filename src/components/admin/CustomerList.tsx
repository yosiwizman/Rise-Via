import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, Eye, User, Building, Plus, X } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { safeToFixed } from '../../utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipTier: 'GREEN' as 'GREEN' | 'SILVER' | 'GOLD' | 'PLATINUM',
    isB2B: false,
    segment: 'New' as 'New' | 'Regular' | 'VIP' | 'Dormant'
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const filters = {
        segment: filterSegment,
        isB2B: filterB2B
      };
      
      const data = await customerService.search(searchTerm, filters);
      setCustomers((data || []) as any[]);
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

  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const customerData = {
        first_name: newCustomer.firstName,
        last_name: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        membership_tier: newCustomer.membershipTier,
        is_b2b: newCustomer.isB2B,
        segment: newCustomer.segment,
        loyalty_points: 0,
        lifetime_value: 0,
        total_orders: 0
      };

      await customerService.create(customerData);
      await fetchCustomers();
      setShowAddModal(false);
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        membershipTier: 'GREEN',
        isB2B: false,
        segment: 'New'
      });
      alert('Customer added successfully!');
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer. Please try again.');
    } finally {
      setIsCreating(false);
    }
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

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSegment, filterB2B]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-risevia-purple to-risevia-teal">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button onClick={exportCustomers} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
              ${safeToFixed(customers.reduce((sum, c) => sum + (c.customer_profiles?.[0]?.lifetime_value || c.profile?.lifetimeValue || 0), 0), 0)}
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
                {paginatedCustomers.map((customer) => (
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
                    <td className="p-3">${safeToFixed(customer.customer_profiles?.[0]?.lifetime_value || customer.profile?.lifetimeValue || 0)}</td>
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              
              <span className="text-sm text-gray-600 ml-4">
                Page {currentPage} of {totalPages} ({customers.length} total customers)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Customer</h3>
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membershipTier">Membership Tier</Label>
                  <Select value={newCustomer.membershipTier} onValueChange={(value: 'GREEN' | 'SILVER' | 'GOLD' | 'PLATINUM') => setNewCustomer(prev => ({ ...prev, membershipTier: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GREEN">GREEN</SelectItem>
                      <SelectItem value="SILVER">SILVER</SelectItem>
                      <SelectItem value="GOLD">GOLD</SelectItem>
                      <SelectItem value="PLATINUM">PLATINUM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="segment">Customer Segment</Label>
                  <Select value={newCustomer.segment} onValueChange={(value: 'New' | 'Regular' | 'VIP' | 'Dormant') => setNewCustomer(prev => ({ ...prev, segment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Dormant">Dormant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isB2B"
                  checked={newCustomer.isB2B}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, isB2B: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isB2B">B2B Customer</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddCustomer} 
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal"
                >
                  {isCreating ? 'Adding...' : 'Add Customer'}
                </Button>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
