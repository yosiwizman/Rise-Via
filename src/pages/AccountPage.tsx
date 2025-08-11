import { useState, useEffect, useCallback } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { User, Star, Gift, ShoppingBag, Crown, Copy } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { SEOHead } from '../components/SEOHead';
import { sql } from '../lib/neon';

interface Order {
  id: string;
  orderNumber?: string;
  total: number;
  status: string;
  created_at: string;
  items?: Array<{
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
}

interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

interface MembershipTier {
  name: string;
  benefits: string[];
}

export const AccountPage = () => {
  const { customer, isAuthenticated, loading } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null);

  const fetchCustomerData = useCallback(async () => {
    try {
      if (!customer?.id) return;

      const ordersData = await sql`SELECT * FROM orders WHERE customer_id = ${customer.id} ORDER BY created_at DESC`;

      const transactionsData = await sql`SELECT * FROM loyalty_transactions WHERE customer_id = ${customer.id} ORDER BY created_at DESC`;

      setOrders((ordersData as Array<{ id: string; orderNumber?: string; total: number; status: string; created_at: string; items?: Array<{ product: { name: string; images: string[] }; quantity: number; price: number }> }>) || []);
      setLoyaltyTransactions((transactionsData as Array<{ id: string; type: string; points: number; description: string; created_at: string }>) || []);

      const tierName = customer.customer_profiles?.[0]?.membership_tier || 'GREEN';
      const tierInfo = { name: tierName, benefits: [] };
      setMembershipTier(tierInfo);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      setOrders([]);
      setLoyaltyTransactions([]);
    }
  }, [customer?.id, customer?.customer_profiles]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchCustomerData();
    }
  }, [isAuthenticated, customer, fetchCustomerData]);

  const copyReferralCode = () => {
    const referralCode = customer?.customer_profiles?.[0]?.referral_code || 'RISEVIA2024';
    navigator.clipboard.writeText(referralCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-risevia-purple mx-auto mb-4"></div>
          <p className="text-risevia-charcoal">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <User className="w-16 h-16 mx-auto text-risevia-purple mb-4" />
            <CardTitle className="text-2xl">Account Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Please log in to view your account information, order history, and loyalty rewards.
            </p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPoints = customer?.customer_profiles?.[0]?.loyalty_points || 0;
  const lifetimeValue = customer?.customer_profiles?.[0]?.lifetime_value || 0;
  const totalOrders = customer?.customer_profiles?.[0]?.total_orders || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 p-4">
      <SEOHead
        title="My Account - RiseViA"
        description="Manage your RiseViA account, view order history, and track loyalty rewards"
      />
      
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-xl text-gray-600">
            Welcome back, {customer?.first_name || 'Valued Customer'}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No orders yet. Start shopping to see your order history!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Loyalty Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loyaltyTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {loyaltyTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No loyalty activity yet. Start earning points with your purchases!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold">{customer?.first_name} {customer?.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="font-semibold">{customer?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Member Since</label>
                  <p className="font-semibold">
                    {customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Membership Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-risevia-purple mb-2">
                    {membershipTier?.name || 'GREEN'}
                  </div>
                  <p className="text-sm text-gray-600">Current Tier</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-risevia-teal">{currentPoints}</div>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-risevia-purple">${lifetimeValue.toFixed(0)}</div>
                    <p className="text-sm text-gray-600">Lifetime Value</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">{totalOrders}</div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share your referral code and earn rewards when friends make their first purchase!
                </p>
                
                <div className="flex gap-2">
                  <Input 
                    value={customer?.customer_profiles?.[0]?.referral_code || 'RISEVIA2024'}
                    readOnly 
                    className="font-mono"
                  />
                  <Button onClick={copyReferralCode} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {customer?.customer_profiles?.[0]?.total_referrals || 0}
                  </div>
                  <p className="text-sm text-gray-600">Successful Referrals</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
