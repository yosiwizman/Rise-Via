import { sql } from '../../lib/neon';

export interface Territory {
  id: string;
  name: string;
  code: string;
  type: 'zip_code' | 'city' | 'county' | 'state' | 'custom';
  zip_codes?: string[];
  cities?: string[];
  counties?: string[];
  states?: string[];
  custom_boundary?: any; // GeoJSON
  is_exclusive: boolean;
  max_reps: number;
  priority_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TerritoryAssignment {
  id: string;
  rep_id: string;
  territory_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_primary: boolean;
  commission_split: number;
  is_active: boolean;
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
   * Create a new territory
   */
  async createTerritory(territoryData: Partial<Territory>): Promise<{ success: boolean; territory?: Territory; error?: string }> {
    try {
      const result = await sql`
        INSERT INTO territories (
          name, code, type, zip_codes, cities, counties, states,
          custom_boundary, is_exclusive, max_reps, priority_level
        ) VALUES (
          ${territoryData.name}, ${territoryData.code}, ${territoryData.type},
          ${territoryData.zip_codes || []}, ${territoryData.cities || []},
          ${territoryData.counties || []}, ${territoryData.states || []},
          ${territoryData.custom_boundary || null}, ${territoryData.is_exclusive ?? true},
          ${territoryData.max_reps || 1}, ${territoryData.priority_level || 1}
        )
        RETURNING *
      `;

      if (result && result.length > 0) {
        return { success: true, territory: result[0] as Territory };
      }

      return { success: false, error: 'Failed to create territory' };
    } catch (error) {
      console.error('Error creating territory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create territory' 
      };
    }
  }

  /**
   * Find territory by location (ZIP code, city, etc.)
   */
  async findTerritoryByLocation(location: {
    zip?: string;
    city?: string;
    county?: string;
    state?: string;
  }): Promise<Territory | null> {
    try {
      let query = sql`
        SELECT * FROM territories 
        WHERE is_active = true
      `;

      if (location.zip) {
        query = sql`
          SELECT * FROM territories 
          WHERE is_active = true
          AND (
            ${location.zip} = ANY(zip_codes)
            OR type = 'state' AND ${location.state} = ANY(states)
          )
          ORDER BY priority_level DESC, type DESC
          LIMIT 1
        `;
      } else if (location.city && location.state) {
        query = sql`
          SELECT * FROM territories 
          WHERE is_active = true
          AND (
            ${location.city} = ANY(cities)
            OR ${location.state} = ANY(states)
          )
          ORDER BY priority_level DESC, type DESC
          LIMIT 1
        `;
      }

      const result = await query;
      return result && result.length > 0 ? result[0] as Territory : null;
    } catch (error) {
      console.error('Error finding territory by location:', error);
      return null;
    }
  }

  /**
   * Assign territory to rep
   */
  async assignTerritoryToRep(
    territoryId: string,
    repId: string,
    assignedBy?: string,
    commissionSplit: number = 100
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if territory is exclusive and already assigned
      const territory = await sql`
        SELECT * FROM territories WHERE id = ${territoryId}
      `;

      if (!territory || territory.length === 0) {
        return { success: false, error: 'Territory not found' };
      }

      const territoryData = territory[0] as Territory;

      if (territoryData.is_exclusive) {
        const existingAssignments = await sql`
          SELECT COUNT(*) as count FROM rep_territory_assignments
          WHERE territory_id = ${territoryId} AND is_active = true
        `;

        if (existingAssignments[0].count >= territoryData.max_reps) {
          return { success: false, error: 'Territory is already at maximum capacity' };
        }
      }

      // Create assignment
      await sql`
        INSERT INTO rep_territory_assignments (
          rep_id, territory_id, assigned_by, commission_split, is_primary
        ) VALUES (
          ${repId}, ${territoryId}, ${assignedBy || null}, ${commissionSplit}, true
        )
      `;

      // Update rep's territory_ids array
      await sql`
        UPDATE sales_reps 
        SET territory_ids = array_append(territory_ids, ${territoryId}::uuid)
        WHERE id = ${repId}
      `;

      return { success: true };
    } catch (error) {
      console.error('Error assigning territory to rep:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to assign territory' 
      };
    }
  }

  /**
   * Get rep's territories
   */
  async getRepTerritories(repId: string): Promise<Territory[]> {
    try {
      const result = await sql`
        SELECT t.* FROM territories t
        JOIN rep_territory_assignments rta ON t.id = rta.territory_id
        WHERE rta.rep_id = ${repId} AND rta.is_active = true
      `;

      return result as Territory[];
    } catch (error) {
      console.error('Error fetching rep territories:', error);
      return [];
    }
  }

  /**
   * Check if location is in rep's territory
   */
  async isLocationInRepTerritory(
    repId: string,
    location: { zip?: string; city?: string; state?: string }
  ): Promise<boolean> {
    try {
      const repTerritories = await this.getRepTerritories(repId);
      
      for (const territory of repTerritories) {
        if (location.zip && territory.zip_codes?.includes(location.zip)) {
          return true;
        }
        if (location.city && territory.cities?.includes(location.city)) {
          return true;
        }
        if (location.state && territory.states?.includes(location.state)) {
          return true;
        }
      }

      // Check if rep can sell outside territory
      const rep = await sql`
        SELECT can_sell_outside_territory FROM sales_reps WHERE id = ${repId}
      `;

      return rep[0]?.can_sell_outside_territory || false;
    } catch (error) {
      console.error('Error checking territory access:', error);
      return false;
    }
  }

  /**
   * Auto-assign rep based on territory
   */
  async autoAssignRepByTerritory(location: {
    zip?: string;
    city?: string;
    state?: string;
  }): Promise<{ repId?: string; territoryId?: string }> {
    try {
      // Find territory for location
      const territory = await this.findTerritoryByLocation(location);
      
      if (!territory) {
        return {};
      }

      // Find active rep assigned to this territory
      const assignment = await sql`
        SELECT rep_id FROM rep_territory_assignments
        WHERE territory_id = ${territory.id}
        AND is_active = true
        AND is_primary = true
        ORDER BY assigned_at
        LIMIT 1
      `;

      if (assignment && assignment.length > 0) {
        return {
          repId: assignment[0].rep_id,
          territoryId: territory.id
        };
      }

      return { territoryId: territory.id };
    } catch (error) {
      console.error('Error auto-assigning rep by territory:', error);
      return {};
    }
  }
}

export const territoryService = TerritoryService.getInstance();
