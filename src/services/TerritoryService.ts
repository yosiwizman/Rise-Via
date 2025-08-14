import { sql } from '../lib/neon';

export interface Territory {
  id: string;
  name: string;
  description?: string;
  zip_codes: string[];
  city?: string;
  state: string;
  assigned_rep_id?: string;
  assigned_rep_name?: string;
  status: 'available' | 'assigned' | 'protected' | 'house';
  protection_type: 'first-to-sign' | 'performance-based' | 'time-limited' | 'none';
  protection_start_date?: string;
  protection_end_date?: string;
  created_at: string;
  updated_at: string;
  boundaries?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  metrics?: {
    total_accounts: number;
    active_accounts: number;
    monthly_revenue: number;
    growth_rate: number;
  };
}

export interface TerritoryAssignment {
  id: string;
  territory_id: string;
  rep_id: string;
  assigned_date: string;
  assigned_by: string;
  status: 'active' | 'pending' | 'expired' | 'transferred';
  protection_level: 'full' | 'partial' | 'none';
  commission_override?: number;
  notes?: string;
  transfer_history?: Array<{
    from_rep_id: string;
    to_rep_id: string;
    transfer_date: string;
    reason: string;
    approved_by: string;
  }>;
}

export interface TerritoryProtectionRule {
  id: string;
  territory_id: string;
  rule_type: 'lifetime' | 'performance' | 'time-based' | 'hybrid';
  conditions: {
    minimum_accounts?: number;
    minimum_revenue?: number;
    time_period_months?: number;
    performance_threshold?: number;
  };
  inheritance_rules?: {
    allow_inheritance: boolean;
    approved_inheritors?: string[];
    require_approval: boolean;
  };
  split_commission_rules?: {
    enabled: boolean;
    split_percentage?: number;
    conditions?: string[];
  };
}

interface TerritoryConflict {
  territory_id: string;
  conflicting_rep_id: string;
  current_rep_id: string;
  conflict_type: 'overlap' | 'dispute' | 'transfer_request';
  resolution_status: 'pending' | 'resolved' | 'escalated';
}

class TerritoryService {
  private static instance: TerritoryService;

  public static getInstance(): TerritoryService {
    if (!TerritoryService.instance) {
      TerritoryService.instance = new TerritoryService();
    }
    return TerritoryService.instance;
  }

  /**
   * Get all territories with optional filtering
   */
  async getTerritories(filters?: {
    state?: string;
    status?: string;
    rep_id?: string;
  }): Promise<Territory[]> {
    try {
      let query = sql`
        SELECT 
          t.*,
          r.first_name || ' ' || r.last_name as assigned_rep_name,
          COUNT(DISTINCT ba.id) as total_accounts,
          COUNT(DISTINCT CASE WHEN ba.status = 'active' THEN ba.id END) as active_accounts,
          COALESCE(SUM(o.total_amount), 0) as monthly_revenue
        FROM territories t
        LEFT JOIN users r ON t.assigned_rep_id = r.id
        LEFT JOIN business_accounts ba ON ba.territory_id = t.id
        LEFT JOIN orders o ON o.customer_id = ba.id 
          AND o.created_at >= NOW() - INTERVAL '30 days'
        WHERE 1=1
      `;

      if (filters?.state) {
        query = sql`${query} AND t.state = ${filters.state}`;
      }
      if (filters?.status) {
        query = sql`${query} AND t.status = ${filters.status}`;
      }
      if (filters?.rep_id) {
        query = sql`${query} AND t.assigned_rep_id = ${filters.rep_id}`;
      }

      query = sql`${query} GROUP BY t.id, r.first_name, r.last_name ORDER BY t.name`;

      const result = await query;
      
      return result.map(row => ({
        ...row,
        metrics: {
          total_accounts: row.total_accounts || 0,
          active_accounts: row.active_accounts || 0,
          monthly_revenue: row.monthly_revenue || 0,
          growth_rate: 0 // Would need historical data to calculate
        }
      }));
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  }

  /**
   * Get territory by ID
   */
  async getTerritoryById(territoryId: string): Promise<Territory | null> {
    try {
      const result = await sql`
        SELECT 
          t.*,
          r.first_name || ' ' || r.last_name as assigned_rep_name
        FROM territories t
        LEFT JOIN users r ON t.assigned_rep_id = r.id
        WHERE t.id = ${territoryId}
      `;

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching territory:', error);
      throw error;
    }
  }

  /**
   * Find territory by ZIP code
   */
  async findTerritoryByZipCode(zipCode: string): Promise<Territory | null> {
    try {
      const result = await sql`
        SELECT t.*, r.first_name || ' ' || r.last_name as assigned_rep_name
        FROM territories t
        LEFT JOIN users r ON t.assigned_rep_id = r.id
        WHERE ${zipCode} = ANY(t.zip_codes)
        AND t.status IN ('assigned', 'protected')
        LIMIT 1
      `;

      return result[0] || null;
    } catch (error) {
      console.error('Error finding territory by ZIP:', error);
      throw error;
    }
  }

  /**
   * Create a new territory
   */
  async createTerritory(territory: Omit<Territory, 'id' | 'created_at' | 'updated_at'>): Promise<Territory> {
    try {
      // Check for ZIP code conflicts
      const conflicts = await this.checkZipCodeConflicts(territory.zip_codes);
      if (conflicts.length > 0) {
        throw new Error(`ZIP codes already assigned to other territories: ${conflicts.join(', ')}`);
      }

      const result = await sql`
        INSERT INTO territories (
          name, description, zip_codes, city, state,
          assigned_rep_id, status, protection_type,
          protection_start_date, protection_end_date, boundaries
        ) VALUES (
          ${territory.name},
          ${territory.description || null},
          ${territory.zip_codes},
          ${territory.city || null},
          ${territory.state},
          ${territory.assigned_rep_id || null},
          ${territory.status},
          ${territory.protection_type},
          ${territory.protection_start_date || null},
          ${territory.protection_end_date || null},
          ${JSON.stringify(territory.boundaries) || null}
        )
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error creating territory:', error);
      throw error;
    }
  }

  /**
   * Update territory
   */
  async updateTerritory(
    territoryId: string,
    updates: Partial<Territory>
  ): Promise<Territory> {
    try {
      // If updating ZIP codes, check for conflicts
      if (updates.zip_codes) {
        const conflicts = await this.checkZipCodeConflicts(updates.zip_codes, territoryId);
        if (conflicts.length > 0) {
          throw new Error(`ZIP codes already assigned to other territories: ${conflicts.join(', ')}`);
        }
      }

      const result = await sql`
        UPDATE territories
        SET
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          zip_codes = COALESCE(${updates.zip_codes}, zip_codes),
          city = COALESCE(${updates.city}, city),
          state = COALESCE(${updates.state}, state),
          status = COALESCE(${updates.status}, status),
          protection_type = COALESCE(${updates.protection_type}, protection_type),
          updated_at = NOW()
        WHERE id = ${territoryId}
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error updating territory:', error);
      throw error;
    }
  }

  /**
   * Assign territory to sales rep
   */
  async assignTerritoryToRep(
    territoryId: string,
    repId: string,
    assignedBy: string,
    protectionLevel: 'full' | 'partial' | 'none' = 'full'
  ): Promise<TerritoryAssignment> {
    try {
      // Check if territory is already assigned
      const territory = await this.getTerritoryById(territoryId);
      if (!territory) {
        throw new Error('Territory not found');
      }

      if (territory.assigned_rep_id && territory.status === 'protected') {
        throw new Error('Territory is already protected and assigned');
      }

      // Create assignment record
      const assignment = await sql`
        INSERT INTO territory_assignments (
          territory_id, rep_id, assigned_date, assigned_by,
          status, protection_level
        ) VALUES (
          ${territoryId},
          ${repId},
          NOW(),
          ${assignedBy},
          'active',
          ${protectionLevel}
        )
        RETURNING *
      `;

      // Update territory
      await sql`
        UPDATE territories
        SET 
          assigned_rep_id = ${repId},
          status = ${protectionLevel === 'full' ? 'protected' : 'assigned'},
          protection_start_date = NOW(),
          updated_at = NOW()
        WHERE id = ${territoryId}
      `;

      // Update all business accounts in this territory
      await sql`
        UPDATE business_accounts
        SET 
          sales_rep_id = ${repId},
          updated_at = NOW()
        WHERE territory_id = ${territoryId}
      `;

      return assignment[0];
    } catch (error) {
      console.error('Error assigning territory:', error);
      throw error;
    }
  }

  /**
   * Transfer territory between reps
   */
  async transferTerritory(
    territoryId: string,
    fromRepId: string,
    toRepId: string,
    reason: string,
    approvedBy: string
  ): Promise<TerritoryAssignment> {
    try {
      // Validate territory and current assignment
      const territory = await this.getTerritoryById(territoryId);
      if (!territory) {
        throw new Error('Territory not found');
      }

      if (territory.assigned_rep_id !== fromRepId) {
        throw new Error('Territory is not assigned to the specified rep');
      }

      // Check protection rules
      const protectionRules = await this.getTerritoryProtectionRules(territoryId);
      if (protectionRules?.rule_type === 'lifetime' && !approvedBy) {
        throw new Error('Lifetime protected territories require admin approval for transfer');
      }

      // Update current assignment to transferred
      await sql`
        UPDATE territory_assignments
        SET 
          status = 'transferred',
          updated_at = NOW()
        WHERE territory_id = ${territoryId} 
          AND rep_id = ${fromRepId}
          AND status = 'active'
      `;

      // Create new assignment
      const newAssignment = await sql`
        INSERT INTO territory_assignments (
          territory_id, rep_id, assigned_date, assigned_by,
          status, protection_level, notes
        ) VALUES (
          ${territoryId},
          ${toRepId},
          NOW(),
          ${approvedBy},
          'active',
          'full',
          ${`Transferred from ${fromRepId}: ${reason}`}
        )
        RETURNING *
      `;

      // Update territory
      await sql`
        UPDATE territories
        SET 
          assigned_rep_id = ${toRepId},
          updated_at = NOW()
        WHERE id = ${territoryId}
      `;

      // Update business accounts
      await sql`
        UPDATE business_accounts
        SET 
          sales_rep_id = ${toRepId},
          updated_at = NOW()
        WHERE territory_id = ${territoryId}
      `;

      // Log transfer history
      await sql`
        INSERT INTO territory_transfer_history (
          territory_id, from_rep_id, to_rep_id,
          transfer_date, reason, approved_by
        ) VALUES (
          ${territoryId},
          ${fromRepId},
          ${toRepId},
          NOW(),
          ${reason},
          ${approvedBy}
        )
      `;

      return newAssignment[0];
    } catch (error) {
      console.error('Error transferring territory:', error);
      throw error;
    }
  }

  /**
   * Get territory protection rules
   */
  async getTerritoryProtectionRules(territoryId: string): Promise<TerritoryProtectionRule | null> {
    try {
      const result = await sql`
        SELECT * FROM territory_protection_rules
        WHERE territory_id = ${territoryId}
        LIMIT 1
      `;

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching protection rules:', error);
      throw error;
    }
  }

  /**
   * Set territory protection rules
   */
  async setTerritoryProtectionRules(
    territoryId: string,
    rules: Omit<TerritoryProtectionRule, 'id' | 'territory_id'>
  ): Promise<TerritoryProtectionRule> {
    try {
      const result = await sql`
        INSERT INTO territory_protection_rules (
          territory_id, rule_type, conditions,
          inheritance_rules, split_commission_rules
        ) VALUES (
          ${territoryId},
          ${rules.rule_type},
          ${JSON.stringify(rules.conditions)},
          ${JSON.stringify(rules.inheritance_rules || {})},
          ${JSON.stringify(rules.split_commission_rules || {})}
        )
        ON CONFLICT (territory_id) DO UPDATE SET
          rule_type = EXCLUDED.rule_type,
          conditions = EXCLUDED.conditions,
          inheritance_rules = EXCLUDED.inheritance_rules,
          split_commission_rules = EXCLUDED.split_commission_rules,
          updated_at = NOW()
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error setting protection rules:', error);
      throw error;
    }
  }

  /**
   * Check for ZIP code conflicts
   */
  async checkZipCodeConflicts(
    zipCodes: string[],
    excludeTerritoryId?: string
  ): Promise<string[]> {
    try {
      let query = sql`
        SELECT DISTINCT unnest(zip_codes) as zip_code
        FROM territories
        WHERE zip_codes && ${zipCodes}
      `;

      if (excludeTerritoryId) {
        query = sql`${query} AND id != ${excludeTerritoryId}`;
      }

      const result = await query;
      return result.map(r => r.zip_code);
    } catch (error) {
      console.error('Error checking ZIP conflicts:', error);
      return [];
    }
  }

  /**
   * Get rep's territories
   */
  async getRepTerritories(repId: string): Promise<Territory[]> {
    try {
      const result = await sql`
        SELECT t.*, 
          COUNT(DISTINCT ba.id) as total_accounts,
          COALESCE(SUM(o.total_amount), 0) as monthly_revenue
        FROM territories t
        LEFT JOIN business_accounts ba ON ba.territory_id = t.id
        LEFT JOIN orders o ON o.customer_id = ba.id 
          AND o.created_at >= NOW() - INTERVAL '30 days'
        WHERE t.assigned_rep_id = ${repId}
        GROUP BY t.id
        ORDER BY t.name
      `;

      return result.map(row => ({
        ...row,
        metrics: {
          total_accounts: row.total_accounts || 0,
          active_accounts: 0,
          monthly_revenue: row.monthly_revenue || 0,
          growth_rate: 0
        }
      }));
    } catch (error) {
      console.error('Error fetching rep territories:', error);
      throw error;
    }
  }

  /**
   * Calculate territory performance metrics
   */
  async calculateTerritoryMetrics(territoryId: string): Promise<any> {
    try {
      const metrics = await sql`
        SELECT 
          COUNT(DISTINCT ba.id) as total_accounts,
          COUNT(DISTINCT CASE WHEN ba.status = 'active' THEN ba.id END) as active_accounts,
          COUNT(DISTINCT CASE WHEN ba.created_at >= NOW() - INTERVAL '30 days' THEN ba.id END) as new_accounts,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          COALESCE(AVG(o.total_amount), 0) as avg_order_value,
          COUNT(DISTINCT o.id) as total_orders
        FROM territories t
        LEFT JOIN business_accounts ba ON ba.territory_id = t.id
        LEFT JOIN orders o ON o.customer_id = ba.id
        WHERE t.id = ${territoryId}
          AND o.created_at >= NOW() - INTERVAL '30 days'
      `;

      return metrics[0];
    } catch (error) {
      console.error('Error calculating territory metrics:', error);
      throw error;
    }
  }

  /**
   * Handle territory conflicts and disputes
   */
  async reportTerritoryConflict(
    territoryId: string,
    reportingRepId: string,
    conflictType: 'overlap' | 'dispute' | 'transfer_request',
    details: string
  ): Promise<TerritoryConflict> {
    try {
      const territory = await this.getTerritoryById(territoryId);
      if (!territory) {
        throw new Error('Territory not found');
      }

      const conflict = await sql`
        INSERT INTO territory_conflicts (
          territory_id, conflicting_rep_id, current_rep_id,
          conflict_type, details, resolution_status, created_at
        ) VALUES (
          ${territoryId},
          ${reportingRepId},
          ${territory.assigned_rep_id},
          ${conflictType},
          ${details},
          'pending',
          NOW()
        )
        RETURNING *
      `;

      // Notify admins
      // await notificationService.notifyAdmins('territory_conflict', conflict[0]);

      return conflict[0];
    } catch (error) {
      console.error('Error reporting territory conflict:', error);
      throw error;
    }
  }

  /**
   * Auto-assign territory based on ZIP code
   */
  async autoAssignByZipCode(
    businessAccountId: string,
    zipCode: string
  ): Promise<string | null> {
    try {
      const territory = await this.findTerritoryByZipCode(zipCode);
      
      if (territory && territory.assigned_rep_id) {
        // Update business account with territory and rep
        await sql`
          UPDATE business_accounts
          SET 
            territory_id = ${territory.id},
            sales_rep_id = ${territory.assigned_rep_id},
            updated_at = NOW()
          WHERE id = ${businessAccountId}
        `;

        return territory.assigned_rep_id;
      }

      return null;
    } catch (error) {
      console.error('Error auto-assigning territory:', error);
      return null;
    }
  }
}

// Export singleton instance
export const territoryService = TerritoryService.getInstance();

// Export types
export type { Territory, TerritoryAssignment, TerritoryProtectionRule };
