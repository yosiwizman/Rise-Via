module.exports = (req, res) => {
  if (req.method === 'GET') {
    const mockCustomers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: '2024-01-15T10:30:00Z',
        profile: {
          membershipTier: 'GOLD',
          lifetimeValue: 1250.50,
          totalOrders: 8,
          segment: 'VIP',
          isB2B: false,
          loyaltyPoints: 125
        }
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@business.com',
        createdAt: '2024-02-01T14:20:00Z',
        profile: {
          membershipTier: 'PLATINUM',
          lifetimeValue: 5500.00,
          totalOrders: 25,
          segment: 'VIP',
          isB2B: true,
          loyaltyPoints: 550
        }
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.j@email.com',
        createdAt: '2024-03-10T09:15:00Z',
        profile: {
          membershipTier: 'GREEN',
          lifetimeValue: 85.00,
          totalOrders: 2,
          segment: 'New',
          isB2B: false,
          loyaltyPoints: 8
        }
      }
    ];

    const { search, segment, isB2B } = req.query;
    let filteredCustomers = mockCustomers;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    if (segment && segment !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.profile.segment === segment
      );
    }

    if (isB2B === 'true') {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.profile.isB2B === true
      );
    } else if (isB2B === 'false') {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.profile.isB2B === false
      );
    }

    res.json({
      success: true,
      customers: filteredCustomers,
      total: filteredCustomers.length,
      page: 1,
      totalPages: 1
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
