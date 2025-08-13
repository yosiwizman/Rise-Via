/**
 * Marketing Service
 * Orchestrates all marketing and customer experience features
 */

import { 
  triggerEmailAutomation,
  subscribeToEmails,
  createEmailTemplate,
  getEmailAnalytics
} from '../lib/email-automation';
import { 
  updateCustomerAnalytics,
  createCustomerSegment,
  getSegmentCustomers,
  getSegmentInsights,
  updateAllSegmentMemberships
} from '../lib/customer-segmentation';
import { 
  getCustomerLoyalty,
  awardPoints,
  redeemPoints,
  getAvailableRewards,
  getLoyaltyAnalytics
} from '../lib/loyalty-system';
import { 
  applyPromotionsToCart,
  validateCouponCode,
  createPromotion,
  createCouponCode,
  trackAbandonedCart,
  createPriceAlert,
  getPromotionAnalytics
} from '../lib/promotions';

export interface MarketingDashboard {
  emailMarketing: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    subscribers: number;
  };
  customerSegmentation: {
    totalSegments: number;
    totalCustomers: number;
    topSegments: Array<{ name: string; size: number; revenue: number }>;
  };
  loyaltyProgram: {
    totalMembers: number;
    pointsIssued: number;
    pointsRedeemed: number;
    tierDistribution: Array<{ tier: string; count: number }>;
  };
  promotions: {
    activePromotions: number;
    totalDiscountGiven: number;
    conversionRate: number;
    topCoupons: Array<{ code: string; usage: number }>;
  };
}

export class MarketingService {
  /**
   * Get comprehensive marketing dashboard data
   */
  async getMarketingDashboard(
    startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: string = new Date().toISOString()
  ): Promise<MarketingDashboard> {
    try {
      // Get email analytics
      const emailAnalytics = await getEmailAnalytics(startDate, endDate);
      
      // Get loyalty analytics
      const loyaltyAnalytics = await getLoyaltyAnalytics();
      
      // Get promotion analytics
      const promotionAnalytics = await getPromotionAnalytics(startDate, endDate);

      return {
        emailMarketing: {
          totalSent: emailAnalytics.totalSent,
          openRate: emailAnalytics.openRate,
          clickRate: emailAnalytics.clickRate,
          subscribers: 0 // Would need to query email_subscribers table
        },
        customerSegmentation: {
          totalSegments: 0, // Would need to query customer_segments table
          totalCustomers: 0, // Would need to query customer_analytics table
          topSegments: []
        },
        loyaltyProgram: {
          totalMembers: loyaltyAnalytics.totalMembers,
          pointsIssued: loyaltyAnalytics.totalPointsIssued,
          pointsRedeemed: loyaltyAnalytics.totalPointsRedeemed,
          tierDistribution: loyaltyAnalytics.tierDistribution
        },
        promotions: {
          activePromotions: promotionAnalytics.activePromotions,
          totalDiscountGiven: promotionAnalytics.totalDiscountGiven,
          conversionRate: promotionAnalytics.conversionRate,
          topCoupons: []
        }
      };
    } catch (error) {
      console.error('Failed to get marketing dashboard:', error);
      return {
        emailMarketing: { totalSent: 0, openRate: 0, clickRate: 0, subscribers: 0 },
        customerSegmentation: { totalSegments: 0, totalCustomers: 0, topSegments: [] },
        loyaltyProgram: { totalMembers: 0, pointsIssued: 0, pointsRedeemed: 0, tierDistribution: [] },
        promotions: { activePromotions: 0, totalDiscountGiven: 0, conversionRate: 0, topCoupons: [] }
      };
    }
  }

  /**
   * Process customer journey events
   */
  async processCustomerEvent(
    eventType: 'user_registered' | 'order_placed' | 'product_viewed' | 'cart_abandoned' | 'email_opened',
    customerId: string,
    eventData: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      // Update customer analytics
      await updateCustomerAnalytics(customerId);

      // Trigger appropriate email automations
      const customerEmail = eventData.email as string;
      if (customerEmail) {
        await triggerEmailAutomation(eventType, customerEmail, eventData);
      }

      // Handle specific event types
      switch (eventType) {
        case 'user_registered':
          // Subscribe to email list
          if (customerEmail) {
            await subscribeToEmails(
              customerEmail,
              eventData.firstName as string,
              eventData.lastName as string,
              'registration'
            );
          }
          break;

        case 'order_placed':
          // This is handled in orderService.ts
          break;

        case 'cart_abandoned':
          // Track abandoned cart
          if (eventData.sessionId && eventData.cartItems) {
            await trackAbandonedCart(
              eventData.sessionId as string,
              eventData.cartItems as Array<{
                product_id: string;
                product_name: string;
                quantity: number;
                price: number;
                image_url?: string;
              }>,
              customerId,
              customerEmail
            );
          }
          break;
      }
    } catch (error) {
      console.error('Failed to process customer event:', error);
    }
  }

  /**
   * Create targeted marketing campaign
   */
  async createTargetedCampaign(
    campaignName: string,
    segmentId: string,
    templateId: string,
    scheduledFor?: string
  ): Promise<{ success: boolean; error?: string; campaignId?: string }> {
    try {
      // Get segment customers
      const customers = await getSegmentCustomers(segmentId, 1000); // Limit to 1000 for now
      
      if (customers.length === 0) {
        return { success: false, error: 'No customers found in segment' };
      }

      // For each customer, trigger the email automation
      for (const customer of customers) {
        if (scheduledFor) {
          // Schedule for later (would need job queue in production)
          setTimeout(async () => {
            await triggerEmailAutomation('custom', customer.email, {
              firstName: customer.first_name || 'Valued Customer',
              customerId: customer.customer_id
            });
          }, new Date(scheduledFor).getTime() - Date.now());
        } else {
          // Send immediately
          await triggerEmailAutomation('custom', customer.email, {
            firstName: customer.first_name || 'Valued Customer',
            customerId: customer.customer_id
          });
        }
      }

      return { 
        success: true, 
        campaignId: `campaign_${Date.now()}` // Would be a real ID in production
      };
    } catch (error) {
      console.error('Failed to create targeted campaign:', error);
      return { success: false, error: 'Failed to create campaign' };
    }
  }

  /**
   * Smart cart recommendations
   */
  async getCartRecommendations(
    customerId: string,
    cartItems: Array<{ product_id: string; category: string; price: number }>
  ): Promise<{
    promotions: Array<{
      promotion_id: string;
      name: string;
      description: string;
      discount_amount: number;
      coupon_code?: string;
    }>;
    loyaltyRewards: Array<{
      reward_id: string;
      name: string;
      points_required: number;
      discount_value: number;
    }>;
    recommendations: Array<{
      type: 'cross_sell' | 'upsell' | 'loyalty_bonus';
      message: string;
      action?: string;
    }>;
  }> {
    try {
      // Get applicable promotions
      const promotionResult = await applyPromotionsToCart(
        cartItems.map(item => ({
          product_id: item.product_id,
          product_name: 'Product', // Would get from product service
          category: item.category,
          quantity: 1,
          price: item.price
        })),
        customerId
      );

      // Get customer loyalty status
      const loyalty = await getCustomerLoyalty(customerId);
      const availableRewards = loyalty ? await getAvailableRewards(customerId) : [];

      // Generate smart recommendations
      const recommendations: Array<{
        type: 'cross_sell' | 'upsell' | 'loyalty_bonus';
        message: string;
        action?: string;
      }> = [];

      // Loyalty-based recommendations
      if (loyalty) {
        if (loyalty.points_to_next_tier && loyalty.points_to_next_tier <= 100) {
          recommendations.push({
            type: 'loyalty_bonus',
            message: `You're only ${loyalty.points_to_next_tier} points away from ${loyalty.next_tier} tier!`,
            action: 'Add more items to reach the next tier'
          });
        }

        if (availableRewards.length > 0) {
          recommendations.push({
            type: 'loyalty_bonus',
            message: `You have ${loyalty.current_points} points available for rewards!`,
            action: 'View available rewards'
          });
        }
      }

      // Promotion-based recommendations
      if (promotionResult.appliedPromotions.length === 0) {
        recommendations.push({
          type: 'upsell',
          message: 'Add $25 more to qualify for free shipping!',
          action: 'Browse more products'
        });
      }

      return {
        promotions: promotionResult.appliedPromotions.map(p => ({
          promotion_id: p.promotion.id,
          name: p.promotion.name,
          description: p.promotion.description,
          discount_amount: p.discount_amount,
          coupon_code: p.coupon_code
        })),
        loyaltyRewards: availableRewards.slice(0, 3).map(r => ({
          reward_id: r.id,
          name: r.name,
          points_required: r.points_required,
          discount_value: r.reward_value
        })),
        recommendations
      };
    } catch (error) {
      console.error('Failed to get cart recommendations:', error);
      return { promotions: [], loyaltyRewards: [], recommendations: [] };
    }
  }

  /**
   * Customer lifecycle automation
   */
  async setupCustomerLifecycleAutomation(): Promise<void> {
    try {
      // Create welcome series templates
      await createEmailTemplate(
        'Welcome Email 1',
        'Welcome to Rise Via! 🌿',
        `
          <h1>Welcome to Rise Via!</h1>
          <p>Hi {{firstName}},</p>
          <p>Welcome to the Rise Via family! We're excited to have you join our community of cannabis enthusiasts.</p>
          <p>Here's what you can expect:</p>
          <ul>
            <li>Premium quality products</li>
            <li>Fast, discreet delivery</li>
            <li>Exclusive member benefits</li>
            <li>Expert customer support</li>
          </ul>
          <p>As a welcome gift, enjoy 10% off your first order with code: WELCOME10</p>
          <a href="{{shopUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Start Shopping
          </a>
          <p>Happy exploring!</p>
          <p>The Rise Via Team</p>
        `,
        'Welcome to Rise Via! We\'re excited to have you join our community.',
        'welcome',
        ['firstName', 'shopUrl']
      );

      // Create abandoned cart templates
      await createEmailTemplate(
        'Abandoned Cart Recovery',
        'Don\'t forget your items! 🛒',
        `
          <h1>You left something behind!</h1>
          <p>Hi {{firstName}},</p>
          <p>We noticed you left some great items in your cart. Don't worry, we saved them for you!</p>
          <div style="border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Your Cart Items:</h3>
            {{cartItems}}
            <p><strong>Total: ${{cartTotal}}</strong></p>
          </div>
          <p>Complete your purchase now and get 10% off with code: {{recoveryCode}}</p>
          <a href="{{recoveryUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Complete Your Order
          </a>
          <p>This offer expires in 7 days.</p>
          <p>The Rise Via Team</p>
        `,
        'Complete your purchase and save 10%!',
        'abandoned_cart',
        ['firstName', 'cartItems', 'cartTotal', 'recoveryCode', 'recoveryUrl']
      );

      // Create loyalty milestone template
      await createEmailTemplate(
        'Loyalty Tier Upgrade',
        'Congratulations! You\'ve reached {{newTier}} status! 🎉',
        `
          <h1>Congratulations, {{firstName}}!</h1>
          <p>You've just reached <strong>{{newTier}}</strong> status in our loyalty program!</p>
          <p>As a {{newTier}} member, you now enjoy:</p>
          <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
            {{benefits}}
          </div>
          <p>Plus, we've added {{bonusPoints}} bonus points to your account!</p>
          <a href="{{loyaltyUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Your Benefits
          </a>
          <p>Thank you for being a valued member!</p>
          <p>The Rise Via Team</p>
        `,
        'You\'ve reached a new loyalty tier with exclusive benefits!',
        'loyalty_milestone',
        ['firstName', 'newTier', 'benefits', 'bonusPoints', 'loyaltyUrl']
      );

      console.log('✅ Customer lifecycle automation templates created');
    } catch (error) {
      console.error('Failed to setup customer lifecycle automation:', error);
    }
  }

  /**
   * Run daily marketing tasks
   */
  async runDailyMarketingTasks(): Promise<void> {
    try {
      console.log('🚀 Running daily marketing tasks...');

      // Update all customer segment memberships
      await updateAllSegmentMemberships();
      console.log('✅ Updated customer segment memberships');

      // This would also include:
      // - Processing abandoned cart recovery (handled in promotions.ts)
      // - Checking price alerts (handled in promotions.ts)
      // - Expiring old loyalty points (handled in loyalty-system.ts)
      // - Generating marketing reports
      // - Cleaning up old email logs

      console.log('✅ Daily marketing tasks completed');
    } catch (error) {
      console.error('Failed to run daily marketing tasks:', error);
    }
  }
}

// Export singleton instance
export const marketingService = new MarketingService();

// Setup lifecycle automation on module load
marketingService.setupCustomerLifecycleAutomation();

// Run daily tasks (in production, this would be handled by a job scheduler)
setInterval(() => {
  marketingService.runDailyMarketingTasks();
}, 24 * 60 * 60 * 1000); // Every 24 hours