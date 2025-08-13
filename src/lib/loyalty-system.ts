/**
 * Loyalty Points System
 * Comprehensive loyalty program with points, tiers, and rewards
 */

import { sql } from './neon';
import { triggerEmailAutomation } from './email-automation';

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  reason: string;
  reference_id?: string; // order_id, reward_id, etc.
  reference_type?: string;
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  reward_type: 'discount_percentage' | 'discount_fixed' | 'free_product' | 'free_shipping' | 'custom';
  reward_value: number; // percentage, dollar amount, etc.
  product_id?: string; // for free product rewards
  max_redemptions?: number;
  current_redemptions: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minimum_points: number;
  minimum_spent?: number;
  benefits: {
    points_multiplier: number;
    discount_percentage?: number;
    free_shipping?: boolean;
    early_access?: boolean;
    birthday_bonus?: number;
    custom_benefits?: string[];
  };
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyalty {
  customer_id: string;
  current_points: number;
  lifetime_points: number;
  current_tier: string;
  tier_progress: number; // percentage to next tier
  next_tier?: string;
  points_to_next_tier?: number;
  tier_benefits: LoyaltyTier['benefits'];
  pending_points: number; // points from recent orders not yet confirmed
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PointsEarningRule {
  id: string;
  name: string;
  event_type: 'order_placed' | 'product_review' | 'referral' | 'birthday' | 'social_share' | 'custom';
  points_per_dollar?: number;
  fixed_points?: number;
  conditions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Initialize loyalty system tables
 */
export async function initializeLoyaltyTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping loyalty table initialization');
      return;
    }

    // Loyalty transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        transaction_type VARCHAR(20) NOT NULL,
        points INTEGER NOT NULL,
        reason TEXT NOT NULL,
        reference_id VARCHAR(255),
        reference_type VARCHAR(50),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Loyalty rewards table
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        reward_type VARCHAR(50) NOT NULL,
        reward_value DECIMAL(10,2) NOT NULL,
        product_id VARCHAR(255),
        max_redemptions INTEGER,
        current_redemptions INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Loyalty tiers table
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        minimum_points INTEGER NOT NULL,
        minimum_spent DECIMAL(10,2),
        benefits JSONB NOT NULL,
        color VARCHAR(20) DEFAULT '#gray',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customer loyalty status table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_loyalty (
        customer_id UUID PRIMARY KEY,
        current_points INTEGER DEFAULT 0,
        lifetime_points INTEGER DEFAULT 0,
        current_tier VARCHAR(100) DEFAULT 'GREEN',
        pending_points INTEGER DEFAULT 0,
        last_activity_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Points earning rules table
    await sql`
      CREATE TABLE IF NOT EXISTS points_earning_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        points_per_dollar DECIMAL(5,2),
        fixed_points INTEGER,
        conditions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Reward redemptions table
    await sql`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        reward_id UUID NOT NULL,
        points_used INTEGER NOT NULL,
        order_id UUID,
        status VARCHAR(20) DEFAULT 'active',
        redeemed_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON loyalty_rewards(points_required)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_points ON loyalty_tiers(minimum_points)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_loyalty_tier ON customer_loyalty(current_tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reward_redemptions_customer ON reward_redemptions(customer_id)`;

    console.log('✅ Loyalty system tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize loyalty tables:', error);
  }
}

/**
 * Create default loyalty tiers
 */
export async function createDefaultLoyaltyTiers(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping default tiers creation');
      return;
    }

    const defaultTiers = [
      {
        name: 'GREEN',
        minimum_points: 0,
        minimum_spent: 0,
        benefits: {
          points_multiplier: 1,
          discount_percentage: 0,
          free_shipping: false,
          early_access: false,
          birthday_bonus: 50
        },
        color: '#22c55e'
      },
      {
        name: 'SILVER',
        minimum_points: 500,
        minimum_spent: 250,
        benefits: {
          points_multiplier: 1.25,
          discount_percentage: 5,
          free_shipping: false,
          early_access: false,
          birthday_bonus: 100
        },
        color: '#94a3b8'
      },
      {
        name: 'GOLD',
        minimum_points: 1500,
        minimum_spent: 750,
        benefits: {
          points_multiplier: 1.5,
          discount_percentage: 10,
          free_shipping: true,
          early_access: true,
          birthday_bonus: 200
        },
        color: '#fbbf24'
      },
      {
        name: 'PLATINUM',
        minimum_points: 3000,
        minimum_spent: 1500,
        benefits: {
          points_multiplier: 2,
          discount_percentage: 15,
          free_shipping: true,
          early_access: true,
          birthday_bonus: 500,
          custom_benefits: ['Personal account manager', 'Exclusive products']
        },
        color: '#e5e7eb'
      }
    ];

    for (const tier of defaultTiers) {
      await sql`
        INSERT INTO loyalty_tiers (name, minimum_points, minimum_spent, benefits, color)
        VALUES (${tier.name}, ${tier.minimum_points}, ${tier.minimum_spent}, ${JSON.stringify(tier.benefits)}, ${tier.color})
        ON CONFLICT DO NOTHING
      `;
    }

    console.log('✅ Default loyalty tiers created');
  } catch (error) {
    console.error('Failed to create default loyalty tiers:', error);
  }
}

/**
 * Create default points earning rules
 */
export async function createDefaultEarningRules(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping default earning rules creation');
      return;
    }

    const defaultRules = [
      {
        name: 'Purchase Points',
        event_type: 'order_placed',
        points_per_dollar: 1,
        conditions: { minimum_order: 10 }
      },
      {
        name: 'Product Review',
        event_type: 'product_review',
        fixed_points: 25,
        conditions: { verified_purchase: true }
      },
      {
        name: 'Referral Bonus',
        event_type: 'referral',
        fixed_points: 100,
        conditions: { referee_first_purchase: true }
      },
      {
        name: 'Birthday Bonus',
        event_type: 'birthday',
        fixed_points: 100,
        conditions: { once_per_year: true }
      }
    ];

    for (const rule of defaultRules) {
      await sql`
        INSERT INTO points_earning_rules (name, event_type, points_per_dollar, fixed_points, conditions)
        VALUES (${rule.name}, ${rule.event_type}, ${rule.points_per_dollar || null}, ${rule.fixed_points || null}, ${JSON.stringify(rule.conditions)})
        ON CONFLICT DO NOTHING
      `;
    }

    console.log('✅ Default earning rules created');
  } catch (error) {
    console.error('Failed to create default earning rules:', error);
  }
}

/**
 * Award points to customer
 */
export async function awardPoints(
  customerId: string,
  points: number,
  reason: string,
  referenceId?: string,
  referenceType?: string,
  expirationDays?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Service temporarily unavailable' };
    }

    if (points <= 0) {
      return { success: false, error: 'Points must be positive' };
    }

    const expiresAt = expirationDays 
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Record the transaction
    await sql`
      INSERT INTO loyalty_transactions (customer_id, transaction_type, points, reason, reference_id, reference_type, expires_at)
      VALUES (${customerId}, 'earned', ${points}, ${reason}, ${referenceId}, ${referenceType}, ${expiresAt})
    `;

    // Update customer loyalty status
    await sql`
      INSERT INTO customer_loyalty (customer_id, current_points, lifetime_points, last_activity_date, updated_at)
      VALUES (${customerId}, ${points}, ${points}, NOW(), NOW())
      ON CONFLICT (customer_id) DO UPDATE SET
        current_points = customer_loyalty.current_points + ${points},
        lifetime_points = customer_loyalty.lifetime_points + ${points},
        last_activity_date = NOW(),
        updated_at = NOW()
    `;

    // Check for tier upgrade
    await checkTierUpgrade(customerId);

    return { success: true };
  } catch (error) {
    console.error('Failed to award points:', error);
    return { success: false, error: 'Failed to award points' };
  }
}

/**
 * Redeem points for reward
 */
export async function redeemPoints(
  customerId: string,
  rewardId: string,
  orderId?: string
): Promise<{ success: boolean; error?: string; redemptionCode?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Service temporarily unavailable' };
    }

    // Get reward details
    const rewards = await sql`
      SELECT * FROM loyalty_rewards 
      WHERE id = ${rewardId} AND is_active = true
    ` as Array<LoyaltyReward>;

    if (rewards.length === 0) {
      return { success: false, error: 'Reward not found or inactive' };
    }

    const reward = rewards[0];

    // Check if reward is still available
    if (reward.max_redemptions && reward.current_redemptions >= reward.max_redemptions) {
      return { success: false, error: 'Reward is no longer available' };
    }

    // Check validity dates
    const now = new Date();
    if (reward.valid_from && new Date(reward.valid_from) > now) {
      return { success: false, error: 'Reward is not yet available' };
    }
    if (reward.valid_until && new Date(reward.valid_until) < now) {
      return { success: false, error: 'Reward has expired' };
    }

    // Get customer's current points
    const customerLoyalty = await getCustomerLoyalty(customerId);
    if (!customerLoyalty) {
      return { success: false, error: 'Customer loyalty account not found' };
    }

    if (customerLoyalty.current_points < reward.points_required) {
      return { success: false, error: 'Insufficient points' };
    }

    // Deduct points
    await sql`
      INSERT INTO loyalty_transactions (customer_id, transaction_type, points, reason, reference_id, reference_type)
      VALUES (${customerId}, 'redeemed', ${-reward.points_required}, ${'Redeemed: ' + reward.name}, ${rewardId}, 'reward')
    `;

    // Update customer points
    await sql`
      UPDATE customer_loyalty 
      SET current_points = current_points - ${reward.points_required},
          last_activity_date = NOW(),
          updated_at = NOW()
      WHERE customer_id = ${customerId}
    `;

    // Record redemption
    const redemptionCode = `RV-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO reward_redemptions (customer_id, reward_id, points_used, order_id, expires_at)
      VALUES (${customerId}, ${rewardId}, ${reward.points_required}, ${orderId}, ${expiresAt.toISOString()})
    `;

    // Update reward redemption count
    await sql`
      UPDATE loyalty_rewards 
      SET current_redemptions = current_redemptions + 1,
          updated_at = NOW()
      WHERE id = ${rewardId}
    `;

    // Trigger loyalty reward email
    const customerData = await sql`
      SELECT email, first_name FROM users WHERE id = ${customerId}
    ` as Array<{ email: string; first_name: string }>;

    if (customerData.length > 0) {
      await triggerEmailAutomation('loyalty_milestone', customerData[0].email, {
        firstName: customerData[0].first_name || 'Valued Customer',
        rewardName: reward.name,
        pointsUsed: reward.points_required,
        redemptionCode
      });
    }

    return { success: true, redemptionCode };
  } catch (error) {
    console.error('Failed to redeem points:', error);
    return { success: false, error: 'Failed to redeem points' };
  }
}

/**
 * Get customer loyalty status
 */
export async function getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    // Get customer loyalty data
    const loyaltyData = await sql`
      SELECT * FROM customer_loyalty WHERE customer_id = ${customerId}
    ` as Array<CustomerLoyalty>;

    if (loyaltyData.length === 0) {
      // Create initial loyalty record
      await sql`
        INSERT INTO customer_loyalty (customer_id)
        VALUES (${customerId})
      `;
      
      return {
        customer_id: customerId,
        current_points: 0,
        lifetime_points: 0,
        current_tier: 'GREEN',
        tier_progress: 0,
        next_tier: 'SILVER',
        points_to_next_tier: 500,
        tier_benefits: {
          points_multiplier: 1,
          discount_percentage: 0,
          free_shipping: false,
          early_access: false,
          birthday_bonus: 50
        },
        pending_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const loyalty = loyaltyData[0];

    // Get tier information
    const tiers = await sql`
      SELECT * FROM loyalty_tiers 
      WHERE is_active = true 
      ORDER BY minimum_points ASC
    ` as Array<LoyaltyTier>;

    const currentTier = tiers.find(t => t.name === loyalty.current_tier);
    const nextTier = tiers.find(t => t.minimum_points > (currentTier?.minimum_points || 0));

    const tierProgress = nextTier 
      ? Math.min(100, (loyalty.lifetime_points / nextTier.minimum_points) * 100)
      : 100;

    const pointsToNextTier = nextTier 
      ? Math.max(0, nextTier.minimum_points - loyalty.lifetime_points)
      : 0;

    return {
      ...loyalty,
      tier_progress: Math.round(tierProgress * 100) / 100,
      next_tier: nextTier?.name,
      points_to_next_tier: pointsToNextTier,
      tier_benefits: currentTier?.benefits || {
        points_multiplier: 1,
        discount_percentage: 0,
        free_shipping: false,
        early_access: false,
        birthday_bonus: 50
      }
    };
  } catch (error) {
    console.error('Failed to get customer loyalty:', error);
    return null;
  }
}

/**
 * Check and process tier upgrade
 */
export async function checkTierUpgrade(customerId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping tier upgrade check');
      return;
    }

    const loyalty = await getCustomerLoyalty(customerId);
    if (!loyalty) return;

    // Get all tiers ordered by minimum points
    const tiers = await sql`
      SELECT * FROM loyalty_tiers 
      WHERE is_active = true 
      ORDER BY minimum_points DESC
    ` as Array<LoyaltyTier>;

    // Find the highest tier the customer qualifies for
    const qualifyingTier = tiers.find(tier => 
      loyalty.lifetime_points >= tier.minimum_points &&
      (!tier.minimum_spent || loyalty.lifetime_points >= (tier.minimum_spent || 0))
    );

    if (!qualifyingTier || qualifyingTier.name === loyalty.current_tier) {
      return; // No upgrade needed
    }

    // Update customer tier
    await sql`
      UPDATE customer_loyalty 
      SET current_tier = ${qualifyingTier.name},
          updated_at = NOW()
      WHERE customer_id = ${customerId}
    `;

    // Award tier upgrade bonus points
    const bonusPoints = Math.floor(qualifyingTier.minimum_points * 0.1); // 10% bonus
    if (bonusPoints > 0) {
      await awardPoints(
        customerId,
        bonusPoints,
        `Tier upgrade bonus: ${qualifyingTier.name}`,
        qualifyingTier.id,
        'tier_upgrade'
      );
    }

    // Trigger tier upgrade email
    const customerData = await sql`
      SELECT email, first_name FROM users WHERE id = ${customerId}
    ` as Array<{ email: string; first_name: string }>;

    if (customerData.length > 0) {
      await triggerEmailAutomation('loyalty_milestone', customerData[0].email, {
        firstName: customerData[0].first_name || 'Valued Customer',
        newTier: qualifyingTier.name,
        bonusPoints: bonusPoints.toString(),
        benefits: JSON.stringify(qualifyingTier.benefits)
      });
    }

    console.log(`Customer ${customerId} upgraded to ${qualifyingTier.name} tier`);
  } catch (error) {
    console.error('Failed to check tier upgrade:', error);
  }
}

/**
 * Process order points
 */
export async function processOrderPoints(
  customerId: string,
  orderId: string,
  orderTotal: number
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping order points processing');
      return;
    }

    // Get customer's current tier for multiplier
    const loyalty = await getCustomerLoyalty(customerId);
    if (!loyalty) return;

    // Get earning rules for orders
    const rules = await sql`
      SELECT * FROM points_earning_rules 
      WHERE event_type = 'order_placed' AND is_active = true
    ` as Array<PointsEarningRule>;

    for (const rule of rules) {
      // Check conditions
      const conditions = rule.conditions as { minimum_order?: number };
      if (conditions.minimum_order && orderTotal < conditions.minimum_order) {
        continue;
      }

      // Calculate points
      let points = 0;
      if (rule.points_per_dollar) {
        points = Math.floor(orderTotal * rule.points_per_dollar * loyalty.tier_benefits.points_multiplier);
      } else if (rule.fixed_points) {
        points = rule.fixed_points;
      }

      if (points > 0) {
        await awardPoints(
          customerId,
          points,
          `Order purchase points (${rule.name})`,
          orderId,
          'order',
          365 // Points expire in 1 year
        );
      }
    }
  } catch (error) {
    console.error('Failed to process order points:', error);
  }
}

/**
 * Get available rewards for customer
 */
export async function getAvailableRewards(customerId: string): Promise<LoyaltyReward[]> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return [];
    }

    const loyalty = await getCustomerLoyalty(customerId);
    if (!loyalty) return [];

    const rewards = await sql`
      SELECT * FROM loyalty_rewards 
      WHERE is_active = true 
      AND points_required <= ${loyalty.current_points}
      AND (max_redemptions IS NULL OR current_redemptions < max_redemptions)
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until >= NOW())
      ORDER BY points_required ASC
    ` as Array<LoyaltyReward>;

    return rewards || [];
  } catch (error) {
    console.error('Failed to get available rewards:', error);
    return [];
  }
}

/**
 * Expire old points
 */
export async function expireOldPoints(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping points expiration');
      return;
    }

    // Get expired points
    const expiredTransactions = await sql`
      SELECT customer_id, SUM(points) as expired_points
      FROM loyalty_transactions 
      WHERE transaction_type = 'earned' 
      AND expires_at IS NOT NULL 
      AND expires_at < NOW()
      AND id NOT IN (
        SELECT reference_id FROM loyalty_transactions 
        WHERE transaction_type = 'expired' 
        AND reference_type = 'expiration'
      )
      GROUP BY customer_id
    ` as Array<{ customer_id: string; expired_points: number }>;

    for (const expiration of expiredTransactions) {
      // Record expiration transaction
      await sql`
        INSERT INTO loyalty_transactions (customer_id, transaction_type, points, reason)
        VALUES (${expiration.customer_id}, 'expired', ${-expiration.expired_points}, 'Points expired')
      `;

      // Update customer points
      await sql`
        UPDATE customer_loyalty 
        SET current_points = GREATEST(0, current_points - ${expiration.expired_points}),
            updated_at = NOW()
        WHERE customer_id = ${expiration.customer_id}
      `;
    }

    console.log(`Expired points for ${expiredTransactions.length} customers`);
  } catch (error) {
    console.error('Failed to expire old points:', error);
  }
}

/**
 * Get loyalty analytics
 */
export async function getLoyaltyAnalytics(): Promise<{
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  averagePointsPerCustomer: number;
  tierDistribution: Array<{ tier: string; count: number; percentage: number }>;
  topRewards: Array<{ reward_name: string; redemptions: number; points_used: number }>;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalMembers: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        averagePointsPerCustomer: 0,
        tierDistribution: [],
        topRewards: []
      };
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_members,
        AVG(current_points) as avg_points_per_customer
      FROM customer_loyalty
    ` as Array<{ total_members: number; avg_points_per_customer: number }>;

    // Get points issued and redeemed
    const pointsStats = await sql`
      SELECT 
        SUM(CASE WHEN transaction_type = 'earned' THEN points ELSE 0 END) as total_issued,
        SUM(CASE WHEN transaction_type = 'redeemed' THEN ABS(points) ELSE 0 END) as total_redeemed
      FROM loyalty_transactions
    ` as Array<{ total_issued: number; total_redeemed: number }>;

    // Get tier distribution
    const tierDistribution = await sql`
      SELECT 
        current_tier as tier,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customer_loyalty) as percentage
      FROM customer_loyalty
      GROUP BY current_tier
      ORDER BY count DESC
    ` as Array<{ tier: string; count: number; percentage: number }>;

    // Get top rewards
    const topRewards = await sql`
      SELECT 
        lr.name as reward_name,
        COUNT(rr.id) as redemptions,
        SUM(rr.points_used) as points_used
      FROM reward_redemptions rr
      JOIN loyalty_rewards lr ON rr.reward_id = lr.id
      GROUP BY lr.id, lr.name
      ORDER BY redemptions DESC
      LIMIT 10
    ` as Array<{ reward_name: string; redemptions: number; points_used: number }>;

    const stats = overallStats[0] || { total_members: 0, avg_points_per_customer: 0 };
    const points = pointsStats[0] || { total_issued: 0, total_redeemed: 0 };

    return {
      totalMembers: stats.total_members,
      totalPointsIssued: points.total_issued || 0,
      totalPointsRedeemed: points.total_redeemed || 0,
      averagePointsPerCustomer: Math.round((stats.avg_points_per_customer || 0) * 100) / 100,
      tierDistribution: tierDistribution.map(t => ({
        ...t,
        percentage: Math.round(t.percentage * 100) / 100
      })) || [],
      topRewards: topRewards || []
    };
  } catch (error) {
    console.error('Failed to get loyalty analytics:', error);
    return {
      totalMembers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      averagePointsPerCustomer: 0,
      tierDistribution: [],
      topRewards: []
    };
  }
}

// Initialize loyalty tables and create defaults on module load
initializeLoyaltyTables().then(() => {
  createDefaultLoyaltyTiers();
  createDefaultEarningRules();
});

// Run points expiration daily
setInterval(expireOldPoints, 24 * 60 * 60 * 1000);