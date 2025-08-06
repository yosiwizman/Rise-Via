export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    email, firstName, lastName, password, phone,
    businessName, businessLicense, taxExemptId 
  } = req.body;
  
  if (!email || !firstName || !lastName || !password || !businessName || !businessLicense) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields for B2B registration' 
    });
  }

  const newB2BCustomer = {
    id: `b2b-${Date.now()}`,
    email,
    firstName,
    lastName,
    phone,
    createdAt: new Date().toISOString(),
    profile: {
      membershipTier: 'GREEN',
      loyaltyPoints: 0,
      lifetimeValue: 0,
      totalOrders: 0,
      segment: 'New',
      isB2B: true,
      businessName,
      businessLicense,
      taxExemptId,
      wholesaleTier: 'WHOLESALE',
      referralCode: `${businessName.slice(0,2).toUpperCase()}${Date.now().toString().slice(-4)}`
    }
  };

  res.json({ 
    success: true, 
    message: 'B2B registration submitted for approval',
    customer: newB2BCustomer
  });
}
