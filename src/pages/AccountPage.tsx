import { useState, useEffect } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { User, Star, Gift, ShoppingBag, Crown, Copy } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { SEOHead } from '../components/SEOHead';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
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
  createdAt: string;
}

export const AccountPage = () => {
  const { customer, isAuthenticated, loading } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [membershipTier, setMembershipTier] = useState<any>(null);
  const [redeemPoints, setRedeemPoints] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerData();
    }
  }, [isAuthenticated]);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.customer.orders || []);
        setLoyaltyTransactions(data.customer.loyaltyTransactions || []);
        setMembershipTier(data.membershipTier);
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    }
  };

  const handleRedeemPoints = async () => {
    try {
      const points = parseInt(redeemPoints);
      if (points < 100 || points % 100 !== 0) {
        alert('Points must be redeemed in increments of 100 (minimum 100 points)');
        return;
      }

      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/customers/points/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          points,
          description: `Redeemed ${points} points for $${points / 20} discount`
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully redeemed ${points} points for $${points / 20} discount!`);
        setRedeemPoints('');
        fetchCustomerData();
      } else {
        alert(data.message || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('Failed to redeem points:', error);
      alert('Failed to redeem points');
    }
  };

  const copyReferralCode = () => {
    if (customer?.profile?.referralCode) {
      navigator.clipboard.writeText(customer.profile.referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'GOLD': return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'SILVER': return <Star className="w-5 h-5 text-gray-600" />;
      default: return <User className="w-5 h-5 text-green-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your account</h1>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEOHead
        title="My Account - RiseViA"
        description="Manage your RiseViA account, view orders, and track loyalty points"
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Account</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Welcome back,</div>
          <div className="font-semibold">{customer?.firstName} {customer?.lastName}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            {getTierIcon(customer?.profile?.membershipTier || 'GREEN')}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getTierColor(customer?.profile?.membershipTier || 'GREEN')}>
                {membershipTier?.name || 'Green Member'}
              </Badge>
              <div className="text-sm text-gray-600">
                Lifetime Value: ${(customer?.profile?.lifetimeValue || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Total Orders: {customer?.profile?.totalOrders || 0}
              </div>
              {membershipTier?.benefits && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">Benefits:</div>
                  {membershipTier.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600">• {benefit}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="w-4 h-4 ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-risevia-purple">
                {customer?.profile?.loyaltyPoints || 0}
              </div>
              <div className="text-sm text-gray-600">
                Points available
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Points to redeem (min 100)"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  min="100"
                  step="100"
                />
                <Button 
                  onClick={handleRedeemPoints}
                  size="sm"
                  className="w-full"
                  disabled={!redeemPoints || parseInt(redeemPoints) < 100}
                >
                  Redeem for ${parseInt(redeemPoints || '0') / 20} off
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                100 points = $5 discount
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Program</CardTitle>
            <User className="w-4 h-4 ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">Your referral code:</div>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {customer?.profile?.referralCode}
                </code>
                <Button size="sm" variant="outline" onClick={copyReferralCode}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Referrals: {customer?.profile?.totalReferrals || 0}
              </div>
              <div className="text-xs text-gray-500">
                Earn 100 points for each successful referral!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No orders yet. Start shopping to see your orders here!
                </div>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Order #{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.length} item(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total.toFixed(2)}</div>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              Points History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loyaltyTransactions.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No points activity yet. Make a purchase to start earning points!
                </div>
              ) : (
                loyaltyTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === 'EARNED' || transaction.type === 'BONUS' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'EARNED' || transaction.type === 'BONUS' ? '+' : ''}
                      {transaction.points}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
