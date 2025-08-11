import { customerService } from './customerService';

export interface MembershipTier {
  name: string;
  threshold: number;
  discount: number;
  benefits: string[];
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    name: 'GREEN',
    threshold: 0,
    discount: 0.05,
    benefits: [
      '5% discount on all products',
      'Free shipping on orders over $100',
      'Basic customer support',
      'Monthly newsletter'
    ]
  },
  {
    name: 'SILVER',
    threshold: 500,
    discount: 0.10,
    benefits: [
      '10% discount on all products',
      'Free shipping on orders over $75',
      'Priority customer support',
      'Early access to sales',
      'Monthly strain recommendations'
    ]
  },
  {
    name: 'GOLD',
    threshold: 1500,
    discount: 0.15,
    benefits: [
      '15% discount on all products',
      'Free shipping on all orders',
      'Priority customer support',
      'Early access to new products',
      'Exclusive strain previews',
      'Birthday bonus points'
    ]
  },
  {
    name: 'PLATINUM',
    threshold: 5000,
    discount: 0.20,
    benefits: [
      '20% discount on all products',
      'Free express shipping',
      'VIP customer support',
      'First access to limited editions',
      'Personal cannabis consultant',
      'Exclusive events invitations',
      'Double points on all purchases'
    ]
  }
];

export const membershipService = {
  /**
   * Calculate the appropriate membership tier based on lifetime value
   */
  calculateTier(lifetimeValue: number): MembershipTier {
    const sortedTiers = [...MEMBERSHIP_TIERS].sort((a, b) => b.threshold - a.threshold);
    
    for (const tier of sortedTiers) {
      if (lifetimeValue >= tier.threshold) {
        return tier;
      }
    }
    
    return MEMBERSHIP_TIERS[0]; // Default to GREEN
  },

  /**
   * Check if customer should be upgraded and perform the upgrade
   */
  async checkAndUpgradeTier(customerId: string, newLifetimeValue: number): Promise<boolean> {
    try {
      const profile = await customerService.getCustomerProfile(customerId);
      if (!profile) return false;

      const currentTier = MEMBERSHIP_TIERS.find(t => t.name === profile.membership_tier) || MEMBERSHIP_TIERS[0];
      const newTier = this.calculateTier(newLifetimeValue);

      if (newTier.threshold > currentTier.threshold) {
        const updatedProfile = await customerService.updateCustomerProfile(customerId, {
          membership_tier: newTier.name,
          lifetime_value: newLifetimeValue
        });

        if (updatedProfile) {
          const bonusPoints = this.getTierUpgradeBonus(newTier.name);
          if (bonusPoints > 0) {
            await customerService.addLoyaltyTransaction({
              customer_id: customerId,
              type: 'BONUS',
              points: bonusPoints,
              description: `Tier upgrade bonus: Welcome to ${newTier.name} membership!`
            });

            await customerService.updateCustomerProfile(customerId, {
              loyalty_points: (profile.loyalty_points || 0) + bonusPoints
            });
          }

          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  /**
   * Get bonus points for tier upgrades
   */
  getTierUpgradeBonus(tierName: string): number {
    switch (tierName) {
      case 'SILVER': return 250;
      case 'GOLD': return 500;
      case 'PLATINUM': return 1000;
      default: return 0;
    }
  },

  /**
   * Calculate discount amount for a given price and tier
   */
  calculateDiscount(price: number, tierName: string): number {
    const tier = MEMBERSHIP_TIERS.find(t => t.name === tierName);
    if (!tier) return 0;
    
    return price * tier.discount;
  },

  /**
   * Get tier information by name
   */
  getTierInfo(tierName: string): MembershipTier | null {
    return MEMBERSHIP_TIERS.find(t => t.name === tierName) || null;
  },

  /**
   * Generate referral code for customer
   */
  generateReferralCode(firstName: string, lastName: string, customerId: string): string {
    if (!firstName || typeof firstName !== 'string' || !lastName || typeof lastName !== 'string' || !customerId || typeof customerId !== 'string') {
      console.warn('⚠️ generateReferralCode called with invalid parameters:', { firstName, lastName, customerId });
      return 'INVALID';
    }
    
    const namePrefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    const idSuffix = customerId.substring(customerId.length - 4);
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    
    return `${namePrefix}${idSuffix}${randomSuffix}`;
  },

  /**
   * Process referral and award points
   */
  async processReferral(referrerCustomerId: string, newCustomerId: string): Promise<boolean> {
    try {
      await customerService.addLoyaltyTransaction({
        customer_id: referrerCustomerId,
        type: 'BONUS',
        points: 100,
        description: 'Referral bonus: Friend successfully registered!'
      });

      const referrerProfile = await customerService.getCustomerProfile(referrerCustomerId);
      if (referrerProfile) {
        await customerService.updateCustomerProfile(referrerCustomerId, {
          loyalty_points: (referrerProfile.loyalty_points || 0) + 100,
          total_referrals: (referrerProfile.total_referrals || 0) + 1
        });
      }

      await customerService.addLoyaltyTransaction({
        customer_id: newCustomerId,
        type: 'BONUS',
        points: 50,
        description: 'Welcome bonus: Thanks for joining through a referral!'
      });

      const newCustomerProfile = await customerService.getCustomerProfile(newCustomerId);
      if (newCustomerProfile) {
        await customerService.updateCustomerProfile(newCustomerId, {
          loyalty_points: (newCustomerProfile.loyalty_points || 0) + 50
        });
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Calculate points earned from purchase
   */
  calculatePointsEarned(amount: number, tierName: string): number {
    const basePoints = Math.floor(amount); // 1 point per $1
    
    if (tierName === 'PLATINUM') {
      return basePoints * 2;
    }
    
    return basePoints;
  },

  /**
   * Process purchase and update customer profile
   */
  async processPurchase(customerId: string, orderAmount: number): Promise<void> {
    try {
      const profile = await customerService.getCustomerProfile(customerId);
      if (!profile) return;

      const newLifetimeValue = (profile.lifetime_value || 0) + orderAmount;
      const newTotalOrders = (profile.total_orders || 0) + 1;
      const currentTier = profile.membership_tier || 'GREEN';
      
      const pointsEarned = this.calculatePointsEarned(orderAmount, currentTier);
      const newPointsBalance = (profile.loyalty_points || 0) + pointsEarned;

      await customerService.updateCustomerProfile(customerId, {
        lifetime_value: newLifetimeValue,
        total_orders: newTotalOrders,
        loyalty_points: newPointsBalance,
        last_order_date: new Date().toISOString()
      });

      await customerService.addLoyaltyTransaction({
        customer_id: customerId,
        type: 'EARNED',
        points: pointsEarned,
        description: `Purchase reward: $${orderAmount.toFixed(2)} order`
      });

      await this.checkAndUpgradeTier(customerId, newLifetimeValue);
    } catch {
      return;
    }
  }
};
