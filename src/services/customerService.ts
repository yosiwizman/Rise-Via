import { sql } from '../lib/neon';

interface Customer {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at?: string;
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
  preferences: Record<string, unknown>
  created_at: string
  is_b2b?: boolean
  business_name?: string
  business_license?: string
  segment?: string
  lifetime_value?: number
  total_orders?: number
  referral_code?: string
  total_referrals?: number
  last_order_date?: string
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
      SELECT 
        c.*,
        cp.segment,
        cp.is_b2b,
        cp.loyalty_points,
        cp.total_spent,
        cp.last_order_date
      FROM customers c
      LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
      ORDER BY c.created_at DESC
    `;
    
    return customers;
  },

  async create(customer: Customer) {
    const customers = await sql`
      INSERT INTO customers (email, first_name, last_name, phone, created_at)
      VALUES (${customer.email}, ${customer.first_name}, ${customer.last_name}, ${customer.phone || null}, NOW())
      RETURNING *
    ` as Array<{ id: string; email: string; first_name: string; last_name: string; phone?: string; created_at: string }>;
    
    const newCustomer = customers[0];
    
    await sql`
      INSERT INTO customer_profiles (customer_id, created_at)
      VALUES (${newCustomer.id}, NOW())
    `;
    
    return newCustomer;
  },

  async update(id: string, updates: Partial<Customer>) {
    const setClause = Object.keys(updates)
      .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
      .join(', ');
    
    const customers = await sql`
      UPDATE customers 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    ` as Array<Customer>;
    
    return customers[0];
  },

  async search(searchTerm: string, filters: SearchFilters = {}) {
    const whereConditions = [];
    const params = [];
      
      if (searchTerm) {
        whereConditions.push(`(
          c.first_name ILIKE $${params.length + 1} OR 
          c.last_name ILIKE $${params.length + 1} OR 
          c.email ILIKE $${params.length + 1}
        )`);
        params.push(`%${searchTerm}%`);
      }
      
      if (filters.segment && filters.segment !== 'all') {
        whereConditions.push(`cp.segment = $${params.length + 1}`);
        params.push(filters.segment);
      }
      
      if (filters.isB2B && filters.isB2B !== 'all') {
        whereConditions.push(`cp.is_b2b = $${params.length + 1}`);
        params.push(filters.isB2B === 'true');
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';
      
      const customers = await sql`
        SELECT 
          c.*,
          cp.segment,
          cp.is_b2b,
          cp.loyalty_points,
          cp.total_spent,
          cp.last_order_date
        FROM customers c
        LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
        ${sql.unsafe(whereClause)}
        ORDER BY c.created_at DESC
      `;
      
      return customers;
  },

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    const profiles = await sql`
      SELECT * FROM customer_profiles 
      WHERE customer_id = ${customerId}
    ` as Array<Record<string, unknown>>;
    
    return profiles.length > 0 ? (profiles[0] as unknown) as CustomerProfile : null;
  },

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const setClause = Object.keys(updates)
      .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
      .join(', ');
    
    const profiles = await sql`
      UPDATE customer_profiles 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE customer_id = ${customerId}
      RETURNING *
    ` as Array<Record<string, unknown>>;
    
    return profiles.length > 0 ? (profiles[0] as unknown) as CustomerProfile : null;
  },

  async addLoyaltyTransaction(transaction: Omit<LoyaltyTransaction, 'id' | 'created_at'>): Promise<LoyaltyTransaction | null> {
    const transactions = await sql`
      INSERT INTO loyalty_transactions (customer_id, type, points, description, created_at)
      VALUES (${transaction.customer_id}, ${transaction.type}, ${transaction.points}, ${transaction.description}, NOW())
      RETURNING *
    ` as Array<Record<string, unknown>>;
    
    return transactions.length > 0 ? (transactions[0] as unknown) as LoyaltyTransaction : null;
  }
};
