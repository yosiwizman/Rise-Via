module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const mockCustomer = {
    id: 'test-customer-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '555-0123',
    createdAt: '2024-01-01T00:00:00Z',
    profile: {
      membershipTier: 'SILVER',
      loyaltyPoints: 250,
      lifetimeValue: 750.00,
      totalOrders: 5,
      segment: 'Regular',
      isB2B: false,
      referralCode: 'TECO1234',
      totalReferrals: 2
    },
    orders: [
      {
        id: 'order-1',
        total: 150.00,
        status: 'completed',
        createdAt: '2024-03-01T10:00:00Z',
        items: [
          { product: { name: 'Blue Dream', price: 75.00 }, quantity: 2 }
        ]
      }
    ],
    loyaltyTransactions: [
      {
        id: 'tx-1',
        type: 'EARNED',
        points: 15,
        description: 'Order #order-1',
        createdAt: '2024-03-01T10:00:00Z'
      }
    ]
  };

  const membershipTiers = {
    GREEN: { name: 'Green', discount: 0.05, minSpend: 0 },
    SILVER: { name: 'Silver', discount: 0.10, minSpend: 500 },
    GOLD: { name: 'Gold', discount: 0.15, minSpend: 1500 },
    PLATINUM: { name: 'Platinum', discount: 0.20, minSpend: 5000 }
  };

  res.json({ 
    success: true, 
    customer: mockCustomer,
    membershipTier: membershipTiers[mockCustomer.profile.membershipTier]
  });
}
