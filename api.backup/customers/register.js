module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, firstName, lastName, password, phone, dateOfBirth } = req.body;
  
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: email, firstName, lastName, password' 
    });
  }

  const existingCustomers = JSON.parse(localStorage?.getItem?.('customers') || '[]');
  const existingCustomer = existingCustomers.find(c => c.email === email);
  
  if (existingCustomer) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const newCustomer = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    createdAt: new Date().toISOString(),
    profile: {
      membershipTier: 'GREEN',
      loyaltyPoints: 0,
      lifetimeValue: 0,
      totalOrders: 0,
      segment: 'New',
      isB2B: false,
      referralCode: `${firstName.slice(0,2).toUpperCase()}${lastName.slice(0,2).toUpperCase()}${Date.now().toString().slice(-4)}`,
      totalReferrals: 0
    }
  };

  const token = `customer-${newCustomer.id}-${Date.now()}`;
  
  res.json({ 
    success: true, 
    token, 
    customer: newCustomer,
    message: 'Registration successful' 
  });
}
