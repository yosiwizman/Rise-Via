import { sql } from '../../lib/neon';

export interface SalesRep {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  mobile?: string;
  rep_code: string;
  employee_id?: string;
  hire_date?: string;
  commission_rate: number;
  commission_tier: 'standard' | 'silver' | 'gold' | 'platinum';
  override_rate: number;
  territory_ids: string[];
  can_sell_outside_territory: boolean;
  manager_id?: string;
  is_manager: boolean;
  team_name?: string;
  monthly_quota?: number;
  quarterly_quota?: number;
  annual_quota?: number;
  status: 'active' | 'inactive' | 'terminated';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RepAssignment {
  business_account_id: string;
  rep_id: string;
  assigned_at: string;
  assignment_method: 'registration' | 'admin' | 'territory' | 'qr_code' | 'referral' | 'trade_show';
  rep_code_used?: string;
  referral_source?: string;
}

export interface CommissionTransaction {
  id: string;
  rep_id: string;
  order_id?: string;
  business_account_id?: string;
  type: 'sale' | 'bonus' | 'override' | 'adjustment' | 'clawback';
  description?: string;
  order_amount?: number;
  commissionable_amount?: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  sale_date?: string;
  commission_period: string;
  created_at: string;
}

export interface RepPerformanceMetrics {
  total_sales: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  account_count: number;
  new_accounts_this_month: number;
  quota_attainment: number;
  average_order_value: number;
  customer_retention_rate: number;
}

class SalesRepService {
  private static instance: SalesRepService;

  public static getInstance(): SalesRepService {
    if (!SalesRepService.instance) {
      SalesRepService.instance = new SalesRepService();
    }
    return SalesRepService.instance;
  }

  /**
   * Create a new sales rep
   */
  async createSalesRep(repData: Partial<SalesRep>): Promise<{ success: boolean; rep?: SalesRep; error?: string }> {
    try {
      // Generate unique rep code if not provided
      const repCode = repData.rep_code || await this.generateUniqueRepCode(repData.first_name!, repData.last_name!);

      const result = await sql`
        INSERT INTO sales_reps (
          email, password_hash, first_name, last_name, phone, mobile,
          rep_code, employee_id, hire_date, commission_rate, commission_tier,
          override_rate, territory_ids, can_sell_outside_territory,
          manager_id, is_manager, team_name, monthly_quota, quarterly_quota,
          annual_quota, status
        ) VALUES (
          ${repData.email}, ${repData.password_hash || ''}, ${repData.first_name}, 
          ${repData.last_name}, ${repData.phone || null}, ${repData.mobile || null},
          ${repCode}, ${repData.employee_id || null}, ${repData.hire_date || null},
          ${repData.commission_rate || 5.00}, ${repData.commission_tier || 'standard'},
          ${repData.override_rate || 0}, ${repData.territory_ids || []},
          ${repData.can_sell_outside_territory || false}, ${repData.manager_id || null},
          ${repData.is_manager || false}, ${repData.team_name || null},
          ${repData.monthly_quota || null}, ${repData.quarterly_quota || null},
          ${repData.annual_quota || null}, ${repData.status || 'active'}
        )
        RETURNING *
      `;

      if (result && result.length > 0) {
        return { success: true, rep: result[0] as SalesRep };
      }

      return { success: false, error: 'Failed to create sales rep' };
    } catch (error) {
      console.error('Error creating sales rep:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sales rep' 
      };
    }
  }

  /**
   * Get sales rep by ID
   */
  async getSalesRepById(repId: string): Promise<SalesRep | null> {
    try {
      const result = await sql`
        SELECT * FROM sales_reps WHERE id = ${repId}
      `;

      return result && result.length > 0 ? result[0] as SalesRep : null;
    } catch (error) {
      console.error('Error fetching sales rep:', error);
      return null;
    }
  }

  /**
   * Get sales rep by code
   */
  async getSalesRepByCode(repCode: string): Promise<SalesRep | null> {
    try {
      const result = await sql`
        SELECT * FROM sales_reps 
        WHERE UPPER(rep_code) = UPPER(${repCode}) 
        AND status = 'active'
      `;

      return result && result.length > 0 ? result[0] as SalesRep : null;
    } catch (error) {
      console.error('Error fetching sales rep by code:', error);
      return null;
    }
  }

  /**
   * Validate rep code
   */
  async validateRepCode(repCode: string): Promise<{ valid: boolean; rep?: SalesRep }> {
    const rep = await this.getSalesRepByCode(repCode);
    return {
      valid: rep !== null && rep.is_active,
      rep: rep || undefined
    };
  }

  /**
   * Assign rep to business account
   */
  async assignRepToAccount(
    businessAccountId: string,
    repId: string,
    assignmentMethod: RepAssignment['assignment_method'],
    metadata?: {
      repCodeUsed?: string;
      referralSource?: string;
      assignedBy?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if account already has a rep
      const existingAssignment = await sql`
        SELECT assigned_rep_id FROM business_accounts 
        WHERE id = ${businessAccountId}
      `;

      if (existingAssignment && existingAssignment[0]?.assigned_rep_id) {
        // Record history of reassignment
        await sql`
          INSERT INTO rep_account_history (
            business_account_id, rep_id, action, reason, previous_rep_id, created_by
          ) VALUES (
            ${businessAccountId}, ${repId}, 'transferred', 
            'Reassigned via ${assignmentMethod}',
            ${existingAssignment[0].assigned_rep_id},
            ${metadata?.assignedBy || null}
          )
        `;
      } else {
        // Record initial assignment
        await sql`
          INSERT INTO rep_account_history (
            business_account_id, rep_id, action, reason, created_by
          ) VALUES (
            ${businessAccountId}, ${repId}, 'assigned',
            'Initial assignment via ${assignmentMethod}',
            ${metadata?.assignedBy || null}
          )
        `;
      }

      // Update business account with rep assignment
      await sql`
        UPDATE business_accounts SET
          assigned_rep_id = ${repId},
          rep_assigned_at = NOW(),
          rep_assignment_method = ${assignmentMethod},
          rep_code_used = ${metadata?.repCodeUsed || null},
          referral_source = ${metadata?.referralSource || null},
          updated_at = NOW()
        WHERE id = ${businessAccountId}
      `;

      // Send notification to rep
      await this.notifyRepOfNewAccount(repId, businessAccountId);

      return { success: true };
    } catch (error) {
      console.error('Error assigning rep to account:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to assign rep' 
      };
    }
  }

  /**
   * Get rep's assigned accounts
   */
  async getRepAccounts(repId: string): Promise<any[]> {
    try {
      const result = await sql`
        SELECT 
          ba.*,
          COUNT(DISTINCT o.id) as total_orders,
          SUM(o.total_amount) as total_revenue,
          MAX(o.created_at) as last_order_date
        FROM business_accounts ba
        LEFT JOIN orders o ON o.business_account_id = ba.id
        WHERE ba.assigned_rep_id = ${repId}
        GROUP BY ba.id
        ORDER BY ba.company_name
      `;

      return result || [];
    } catch (error) {
      console.error('Error fetching rep accounts:', error);
      return [];
    }
  }

  /**
   * Calculate rep commission for an order
   */
  async calculateCommission(
    repId: string,
    orderId: string,
    orderAmount: number,
    businessAccountId?: string
  ): Promise<{ commissionAmount: number; rate: number; bonuses: any[] }> {
    try {
      // Get rep details
      const rep = await this.getSalesRepById(repId);
      if (!rep) {
        return { commissionAmount: 0, rate: 0, bonuses: [] };
      }

      let baseRate = rep.commission_rate;
      const bonuses: any[] = [];

      // Check for tiered rates based on volume
      const monthlyVolume = await this.getRepMonthlyVolume(repId);
      if (monthlyVolume > 100000) {
        baseRate = 10; // Platinum tier
      } else if (monthlyVolume > 50000) {
        baseRate = 7; // Gold tier
      } else if (monthlyVolume > 25000) {
        baseRate = 5; // Silver tier
      }

      // Check for new customer bonus (first 90 days)
      if (businessAccountId) {
        const accountAge = await this.getAccountAge(businessAccountId);
        if (accountAge <= 90) {
          bonuses.push({
            type: 'new_customer',
            rate: 2,
            amount: orderAmount * 0.02
          });
        }
      }

      // Check for product category rates
      // This would need order details to implement fully

      // Calculate total commission
      const baseCommission = orderAmount * (baseRate / 100);
      const bonusAmount = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const totalCommission = baseCommission + bonusAmount;

      return {
        commissionAmount: totalCommission,
        rate: baseRate,
        bonuses
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      return { commissionAmount: 0, rate: 0, bonuses: [] };
    }
  }

  /**
   * Record commission transaction
   */
  async recordCommission(
    repId: string,
    orderId: string,
    orderAmount: number,
    commissionAmount: number,
    commissionRate: number,
    businessAccountId?: string,
    type: CommissionTransaction['type'] = 'sale'
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const result = await sql`
        INSERT INTO commission_transactions (
          rep_id, order_id, business_account_id, type, description,
          order_amount, commissionable_amount, commission_rate,
          commission_amount, status, sale_date, commission_period
        ) VALUES (
          ${repId}, ${orderId}, ${businessAccountId || null}, ${type},
          ${'Commission for order ' + orderId},
          ${orderAmount}, ${orderAmount}, ${commissionRate},
          ${commissionAmount}, 'pending', NOW(), ${period}
        )
        RETURNING id
      `;

      if (result && result.length > 0) {
        return { success: true, transactionId: result[0].id };
      }

      return { success: false, error: 'Failed to record commission' };
    } catch (error) {
      console.error('Error recording commission:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record commission' 
      };
    }
  }

  /**
   * Get rep performance metrics
   */
  async getRepPerformanceMetrics(repId: string, period?: { start: Date; end: Date }): Promise<RepPerformanceMetrics> {
    try {
      const startDate = period?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = period?.end || new Date();

      // Get sales and commission data
      const metricsResult = await sql`
        SELECT 
          COUNT(DISTINCT ct.order_id) as order_count,
          SUM(ct.order_amount) as total_sales,
          SUM(CASE WHEN ct.status = 'paid' THEN ct.commission_amount ELSE 0 END) as paid_commissions,
          SUM(CASE WHEN ct.status = 'pending' THEN ct.commission_amount ELSE 0 END) as pending_commissions,
          SUM(ct.commission_amount) as total_commissions
        FROM commission_transactions ct
        WHERE ct.rep_id = ${repId}
        AND ct.sale_date BETWEEN ${startDate} AND ${endDate}
      `;

      // Get account metrics
      const accountResult = await sql`
        SELECT 
          COUNT(DISTINCT ba.id) as account_count,
          COUNT(DISTINCT CASE 
            WHEN ba.created_at >= ${startDate} 
            THEN ba.id 
          END) as new_accounts
        FROM business_accounts ba
        WHERE ba.assigned_rep_id = ${repId}
      `;

      // Get rep quota
      const repResult = await sql`
        SELECT monthly_quota, quarterly_quota, annual_quota
        FROM sales_reps
        WHERE id = ${repId}
      `;

      const metrics = metricsResult[0] || {};
      const accounts = accountResult[0] || {};
      const quotas = repResult[0] || {};

      // Calculate quota attainment
      let quotaAttainment = 0;
      if (quotas.monthly_quota) {
        quotaAttainment = (metrics.total_sales / quotas.monthly_quota) * 100;
      }

      // Calculate average order value
      const avgOrderValue = metrics.order_count > 0 
        ? metrics.total_sales / metrics.order_count 
        : 0;

      return {
        total_sales: metrics.total_sales || 0,
        total_commissions: metrics.total_commissions || 0,
        pending_commissions: metrics.pending_commissions || 0,
        paid_commissions: metrics.paid_commissions || 0,
        account_count: accounts.account_count || 0,
        new_accounts_this_month: accounts.new_accounts || 0,
        quota_attainment: quotaAttainment,
        average_order_value: avgOrderValue,
        customer_retention_rate: 0 // Would need more complex calculation
      };
    } catch (error) {
      console.error('Error fetching rep performance metrics:', error);
      return {
        total_sales: 0,
        total_commissions: 0,
        pending_commissions: 0,
        paid_commissions: 0,
        account_count: 0,
        new_accounts_this_month: 0,
        quota_attainment: 0,
        average_order_value: 0,
        customer_retention_rate: 0
      };
    }
  }

  /**
   * Generate unique rep code
   */
  private async generateUniqueRepCode(firstName: string, lastName: string): Promise<string> {
    const baseCode = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    let code = baseCode;
    let counter = 1;

    while (true) {
      const existing = await sql`
        SELECT id FROM sales_reps WHERE rep_code = ${code}
      `;

      if (!existing || existing.length === 0) {
        break;
      }

      code = `${baseCode}${counter.toString().padStart(3, '0')}`;
      counter++;
    }

    return code;
  }

  /**
   * Get rep monthly volume
   */
  private async getRepMonthlyVolume(repId: string): Promise<number> {
    const result = await sql`
      SELECT SUM(order_amount) as volume
      FROM commission_transactions
      WHERE rep_id = ${repId}
      AND commission_period = ${new Date().toISOString().slice(0, 7)}
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
   * Notify rep of new account assignment
   */
  private async notifyRepOfNewAccount(repId: string, businessAccountId: string): Promise<void> {
    // This would integrate with your notification system
    // For now, just log it
    console.log(`Notifying rep ${repId} of new account ${businessAccountId}`);
  }
}

export const salesRepService = SalesRepService.getInstance();
