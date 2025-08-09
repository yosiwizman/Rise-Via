import { sql } from '../lib/neon';

interface Customer {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface SearchFilters {
  segment?: string;
  isB2B?: string;
}

export interface CustomerProfile {
  id: string
  customer_id: string
  membership_tier: string
  loyalty_points: number
  preferences: any
  created_at: string
  is_b2b?: boolean
  business_name?: string
  business_license?: string
  segment?: string
}

export interface LoyaltyTransaction {
  id: string
  customer_id: string
  type: string
  points: number
  description: string
  created_at: string
}

export const customerService = {
  async getAll() {
    const customers = await sql`
      SELECT c.*, 
             json_agg(cp.*) as customer_profiles
      FROM customers c
      LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    return customers as any[];
  },

  async create(customer: Customer) {
    const customers = await sql`
      INSERT INTO customers (email, first_name, last_name, phone)
      VALUES (${customer.email}, ${customer.first_name}, ${customer.last_name}, ${customer.phone || null})
      RETURNING *
    `;
    
    if (customers.length === 0) throw new Error('Failed to create customer');
    
    const newCustomer = customers[0];
    
    await sql`
      INSERT INTO customer_profiles (customer_id)
      VALUES (${newCustomer.id})
    `;
    
    return newCustomer;
  },

  async update(id: string, updates: Partial<Customer>) {
    const customers = await sql`
      UPDATE customers 
      SET email = COALESCE(${updates.email}, email),
          first_name = COALESCE(${updates.first_name}, first_name),
          last_name = COALESCE(${updates.last_name}, last_name),
          phone = COALESCE(${updates.phone}, phone)
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (customers.length === 0) throw new Error('Customer not found');
    return customers[0];
  },

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    try {
      const profiles = await sql`
        SELECT * FROM customer_profiles 
        WHERE customer_id = ${customerId}
      `
      return profiles.length > 0 ? profiles[0] as any : null
    } catch (error) {
      return null
    }
  },

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    try {
      const existingProfiles = await sql`
        SELECT id FROM customer_profiles 
        WHERE customer_id = ${customerId}
      `

      if (existingProfiles.length > 0) {
        const setClause = Object.keys(updates)
          .filter(key => key !== 'id' && key !== 'customer_id' && key !== 'created_at')
          .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
          .join(', ')

        if (!setClause) return null

        const profiles = await sql`
          UPDATE customer_profiles 
          SET ${setClause}, updated_at = NOW()
          WHERE customer_id = ${customerId}
          RETURNING *
        `
        return profiles.length > 0 ? profiles[0] as any : null
      } else {
        const profiles = await sql`
          INSERT INTO customer_profiles (customer_id, membership_tier, loyalty_points, preferences)
          VALUES (${customerId}, ${updates.membership_tier || 'bronze'}, ${updates.loyalty_points || 0}, ${JSON.stringify(updates.preferences || {})})
          RETURNING *
        `
        return profiles.length > 0 ? profiles[0] as any : null
      }
    } catch (error) {
      return null
    }
  },

  async getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    try {
      const transactions = await sql`
        SELECT * FROM loyalty_transactions 
        WHERE customer_id = ${customerId}
        ORDER BY created_at DESC
      `
      return (transactions || []) as any[]
    } catch (error) {
      return []
    }
  },

  async addLoyaltyTransaction(transaction: Omit<LoyaltyTransaction, 'id' | 'created_at'>): Promise<LoyaltyTransaction | null> {
    try {
      const transactions = await sql`
        INSERT INTO loyalty_transactions (customer_id, type, points, description)
        VALUES (${transaction.customer_id}, ${transaction.type}, ${transaction.points}, ${transaction.description})
        RETURNING *
      `
      return transactions.length > 0 ? transactions[0] as any : null
    } catch (error) {
      return null;
    }
  },

  async search(searchTerm: string, filters: SearchFilters = {}) {
    const whereConditions = ['1=1'];

    if (searchTerm) {
      whereConditions.push(`(
        c.first_name ILIKE '%${searchTerm}%' OR 
        c.last_name ILIKE '%${searchTerm}%' OR 
        c.email ILIKE '%${searchTerm}%'
      )`);
    }

    if (filters.segment && filters.segment !== 'all') {
      whereConditions.push(`cp.segment = '${filters.segment}'`);
    }

    if (filters.isB2B && filters.isB2B !== 'all') {
      whereConditions.push(`cp.is_b2b = ${filters.isB2B === 'true'}`);
    }

    const customers = await sql`
      SELECT c.*, 
             json_agg(cp.*) as customer_profiles
      FROM customers c
      LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    return customers as any[];
  }
};
