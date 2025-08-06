const MEMBERSHIP_TIERS = {
  GREEN: { 
    name: "Green Member", 
    requirement: 0, 
    discount: 0.05, 
    benefits: ["5% off all orders", "Birthday discount", "Early access to sales"] 
  },
  SILVER: { 
    name: "Silver Member", 
    requirement: 500, 
    discount: 0.10, 
    benefits: ["10% off all orders", "Free shipping", "Exclusive products"] 
  },
  GOLD: { 
    name: "Gold Member", 
    requirement: 1500, 
    discount: 0.15, 
    benefits: ["15% off all orders", "Priority support", "VIP events"] 
  },
  PLATINUM: { 
    name: "Platinum Member", 
    requirement: 5000, 
    discount: 0.20, 
    benefits: ["20% off all orders", "Personal budtender", "Custom orders"] 
  }
};

const calculateTier = (lifetimeValue) => {
  if (lifetimeValue >= 5000) return 'PLATINUM';
  if (lifetimeValue >= 1500) return 'GOLD';
  if (lifetimeValue >= 500) return 'SILVER';
  return 'GREEN';
};

const applyMemberDiscount = (price, tier) => {
  const discount = MEMBERSHIP_TIERS[tier]?.discount || 0;
  return price * (1 - discount);
};

const calculatePoints = (orderTotal) => {
  return Math.floor(orderTotal);
};

const calculateCustomerSegment = (totalOrders, lifetimeValue, lastOrderDate) => {
  if (lifetimeValue >= 2000) return 'VIP';
  if (totalOrders === 0) return 'New';
  
  const daysSinceLastOrder = lastOrderDate ? 
    Math.floor((new Date() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24)) : 999;
  
  if (daysSinceLastOrder > 90) return 'Dormant';
  return 'Regular';
};

const updateCustomerProfile = async (prisma, customerId, orderTotal) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { profile: true }
  });

  if (!customer || !customer.profile) return;

  const newLifetimeValue = customer.profile.lifetimeValue + orderTotal;
  const newTotalOrders = customer.profile.totalOrders + 1;
  const newAverageOrderValue = newLifetimeValue / newTotalOrders;
  const newTier = calculateTier(newLifetimeValue);
  const newSegment = calculateCustomerSegment(newTotalOrders, newLifetimeValue, new Date());

  await prisma.customerProfile.update({
    where: { customerId },
    data: {
      lifetimeValue: newLifetimeValue,
      totalOrders: newTotalOrders,
      averageOrderValue: newAverageOrderValue,
      lastOrderDate: new Date(),
      membershipTier: newTier,
      segment: newSegment
    }
  });

  const pointsEarned = calculatePoints(orderTotal);
  await prisma.loyaltyTransaction.create({
    data: {
      customerId,
      type: 'EARNED',
      points: pointsEarned,
      description: `Points earned from order #${Date.now()}`
    }
  });

  await prisma.customerProfile.update({
    where: { customerId },
    data: {
      loyaltyPoints: {
        increment: pointsEarned
      }
    }
  });
};

module.exports = {
  MEMBERSHIP_TIERS,
  calculateTier,
  applyMemberDiscount,
  calculatePoints,
  calculateCustomerSegment,
  updateCustomerProfile
};
