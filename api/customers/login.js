module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'password123') {
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
      }
    };

    const token = `customer-${mockCustomer.id}-${Date.now()}`;
    res.json({ success: true, token, customer: mockCustomer });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}
