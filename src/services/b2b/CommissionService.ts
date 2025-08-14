import { sql } from '../../lib/neon';
import { salesRepService } from './SalesRepService';

export interface CommissionRule {
  id: string;
  name: string;
  type: 'tiered' | 'category' | 'bonus' | 'new_customer' | 'performance';
  conditions: any;
  rate_structure: any;
  applies_to_reps?: string[];
  applies_to_territories?: string[];
  applies_to_products?: string[];
  applies_to_categories?: string[];
  valid_from?: string;
  valid_to?: string;
  priority: number;
  is_active: boolean;
}

export interface CommissionCalculation {
  base_amount: number;
  base_rate: number;
  bonuses: Array<{
    type: string;
    description: string;
    amount: number;
    rate?: number;
  }>;
  deductions: Array<{
    type: string;
    description: string;
    amount: number;
  }>;
  total_amount: number;
  effective_rate: number;
}

class CommissionService {
  private static instance: CommissionService;

  public static getInstance(): CommissionService {
    if (!CommissionService.instance) {
      CommissionService.instance = new CommissionService();
    }
    return CommissionService.instance;
  }

  /**
   * Calculate commission for an order
   */
  async calculateOrderCommission(
    orderId: string,
    repId: string,
    orderDetails: {
      amount: number;
      businessAccountId: string;
      products?: Array<{ id: string; category: string; amount: number }>;
      orderDate?: Date;
    }
  ): Promise<CommissionCalculation> {
    try {
      // Get rep details
      const rep = await salesRepService.getSalesRepById(repId);
      if (!rep) {
        throw new Error('Sales rep not found');
      }

      // Initialize calculation
      const calculation: CommissionCalculation = {
        base_amount: 0,
        base_rate: rep.commission_rate,
        bonuses: [],
        deductions: [],
        total_amount: 0,
        effective_rate: 0
      };

      // Calculate base commission
      calculation.base_amount = orderDetails.amount * (rep.commission_rate / 100);

      // Apply commission rules
      const applicableRules = await this.getApplicableRules(repId, orderDetails);
      
      for (const rule of applicableRules) {
        const ruleResult = await this.applyCommissionRule(rule, orderDetails, rep);
        
        if (ruleResult.bonus) {
          calculation.bonuses.push(ruleResult.bonus);
        }
        if (ruleResult.deduction) {
          calculation.deductions.push(ruleResult.deduction);
        }
      }

      // Check for tiered rates based on monthly volume
      const tierBonus = await this.calculateTierBonus(repId, orderDetails.amount);
      if (tierBonus) {
        calculation.bonuses.push(tierBonus);
      }

      // Check for new customer bonus
      const newCustomerBonus = await this.calculateNewCustomerBonus(
        orderDetails.businessAccountId,
        orderDetails.amount
      );
      if (newCustomerBonus) {
        calculation.bonuses.push(newCustomerBonus);
      }

      // Calculate totals
      const totalBonuses = calculation.bonuses.reduce((sum, b) => sum + b.amount, 0);
      const totalDeductions = calculation.deductions.reduce((sum, d) => sum + d.amount, 0);
      calculation.total_amount = calculation.base_amount + totalBonuses - totalDeductions;
      calculation.effective_rate = (calculation.total_amount / orderDetails.amount) * 100;

      return calculation;
    } catch (error) {
      console.error('Error calculating commission:', error);
      return {
        base_amount: 0,
        base_rate: 0,
        bonuses: [],
        deductions: [],
        total_amount: 0,
        effective_rate: 0
      };
    }
  }

  /**
   * Process commission for an order
   */
  async processOrderCommission(
    orderId: string,
    repId: string,
    orderDetails: {
      amount: number;
      businessAccountId: string;
      products?: Array<{ id: string; category: string; amount: number }>;
      orderDate?: Date;
    }
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Calculate commission
      const calculation = await this.calculateOrderCommission(orderId, repId, orderDetails);

      // Record commission transaction
      const result = await salesRepService.recordCommission(
        repId,
        orderId,
        orderDetails.amount,
        calculation.total_amount,
        calculation.effective_rate,
        orderDetails.businessAccountId,
        'sale'
      );

      // Record bonus transactions separately if needed
      for (const bonus of calculation.bonuses) {
        await salesRepService.recordCommission(
          repId,
          orderId,
          0,
          bonus.amount,
          bonus.rate || 0,
          orderDetails.businessAccountId,
          'bonus'
        );
      }

      return result;
    } catch (error) {
      console.error('Error processing commission:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process commission' 
      };
    }
  }

  /**
   * Get applicable commission rules
   */
  private async getApplicableRules(
    repId: string,
    orderDetails: any
  ): Promise<CommissionRule[]> {
    try {
      const now = new Date().toISOString();
      
      const result = await sql`
        SELECT * FROM commission_rules
        WHERE is_active = true
        AND (valid_from IS NULL OR valid_from <= ${now})
        AND (valid_to IS NULL OR valid_to >= ${now})
        AND (
          applies_to_reps IS NULL 
          OR ${repId} = ANY(applies_to_reps)
        )
        ORDER BY priority DESC
      `;

      return result as CommissionRule[];
    } catch (error) {
      console.error('Error fetching commission rules:', error);
      return [];
    }
  }

  /**
   * Apply a commission rule
   */
  private async applyCommissionRule(
    rule: CommissionRule,
    orderDetails: any,
    rep: any
  ): Promise<{ bonus?: any; deduction?: any }> {
    const result: { bonus?: any; deduction?: any } = {};

    switch (rule.type) {
      case 'tiered':
        // Tiered commission based on volume
        if (rule.conditions.volume_threshold) {
          const monthlyVolume = await this.getRepMonthlyVolume(rep.id);
          if (monthlyVolume >= rule.conditions.volume_threshold) {
            const bonusRate = rule.rate_structure.bonus_rate || 0;
            result.bonus = {
              type: 'tiered_bonus',
              description: `Tiered bonus: ${rule.name}`,
              amount: orderDetails.amount * (bonusRate / 100),
              rate: bonusRate
            };
          }
        }
        break;

      case 'category':
        // Category-specific rates
        if (orderDetails.products && rule.applies_to_categories) {
          for (const product of orderDetails.products) {
            if (rule.applies_to_categories.includes(product.category)) {
              const categoryRate = rule.rate_structure.category_rate || 0;
              result.bonus = {
                type: 'category_bonus',
                description: `Category bonus: ${product.category}`,
                amount: product.amount * (categoryRate / 100),
                rate: categoryRate
              };
            }
          }
        }
        break;

      case 'new_customer':
        // New customer bonus
        if (rule.conditions.days_since_signup) {
          const accountAge = await this.getAccountAge(orderDetails.businessAccountId);
          if (accountAge <= rule.conditions.days_since_signup) {
            const bonusRate = rule.rate_structure.bonus_rate || 0;
            result.bonus = {
              type: 'new_customer',
              description: 'New customer bonus',
              amount: orderDetails.amount * (bonusRate / 100),
              rate: bonusRate
            };
          }
        }
        break;

      case 'performance':
        // Performance-based bonus
        if (rule.conditions.quota_percentage) {
          const metrics = await salesRepService.getRepPerformanceMetrics(rep.id);
          if (metrics.quota_attainment >= rule.conditions.quota_percentage) {
            const bonusRate = rule.rate_structure.bonus_rate || 0;
            result.bonus = {
              type: 'performance',
              description: 'Performance bonus',
              amount: orderDetails.amount * (bonusRate / 100),
              rate: bonusRate
            };
          }
        }
        break;
    }

    return result;
  }

  /**
   * Calculate tier bonus based on monthly volume
   */
  private async calculateTierBonus(repId: string, orderAmount: number): Promise<any> {
    const monthlyVolume = await this.getRepMonthlyVolume(repId);
    
    let bonusRate = 0;
    let tierName = 'standard';

    if (monthlyVolume >= 100000) {
      bonusRate = 5; // Additional 5% for platinum
      tierName = 'platinum';
    } else if (monthlyVolume >= 50000) {
      bonusRate = 2; // Additional 2% for gold
      tierName = 'gold';
    } else if (monthlyVolume >= 25000) {
      bonusRate = 1; // Additional 1% for silver
      tierName = 'silver';
    }

    if (bonusRate > 0) {
      return {
        type: 'tier_bonus',
        description: `${tierName} tier bonus`,
        amount: orderAmount * (bonusRate / 100),
        rate: bonusRate
      };
    }

    return null;
  }

  /**
   * Calculate new customer bonus
   */
  private async calculateNewCustomerBonus(
    businessAccountId: string,
    orderAmount: number
  ): Promise<any> {
    const accountAge = await this.getAccountAge(businessAccountId);
    
    if (accountAge <= 90) {
      const bonusRate = 2; // 2% bonus for first 90 days
      return {
        type: 'new_customer',
        description: 'New customer bonus (first 90 days)',
        amount: orderAmount * (bonusRate / 100),
        rate: bonusRate
      };
    }

    return null;
  }

  /**
   * Get rep's monthly sales volume
   */
  private async getRepMonthlyVolume(repId: string): Promise<number> {
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const result = await sql`
      SELECT SUM(order_amount) as volume
      FROM commission_transactions
      WHERE rep_id = ${repId}
      AND commission_period = ${period}
      AND status != 'cancelled'
    `;

    return result[0]?.volume || 0;
  }

  /**
   * Get account age in days
   */
  private async getAccountAge(businessAccountId: string): Promise<number> {
    const result = await sql`
      SELECT created_at FROM business_accounts WHERE id = ${businessAccountId}
    `;

    if (result && result[0]) {
      const createdAt = new Date(result[0].created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    return 0;
  }

  /**
   * Approve commission transactions
   */
  async approveCommissions(
    transactionIds: string[],
    approvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sql`
        UPDATE commission_transactions
        SET 
          status = 'approved',
          approved_at = NOW(),
          approved_by = ${approvedBy},
          updated_at = NOW()
        WHERE id = ANY(${transactionIds})
        AND status = 'pending'
      `;

      return { success: true };
    } catch (error) {
      console.error('Error approving commissions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve commissions' 
      };
    }
  }

  /**
   * Process commission payouts
   */
  async processPayouts(
    period: string,
    paymentReference: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const result = await sql`
        UPDATE commission_transactions
        SET 
          status = 'paid',
          paid_at = NOW(),
          payment_reference = ${paymentReference},
          updated_at = NOW()
        WHERE commission_period = ${period}
        AND status = 'approved'
        RETURNING id
      `;

      return { 
        success: true, 
        count: result.length 
      };
    } catch (error) {
      console.error('Error processing payouts:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process payouts' 
      };
    }
  }
}

export const commissionService = CommissionService.getInstance();
