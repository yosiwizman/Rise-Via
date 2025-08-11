const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (customerService):', query, values);
    
    if (query.includes('customers')) {
      return Promise.resolve([{
        id: 'mock-customer-id',
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        created_at: new Date().toISOString(),
        segment: 'premium',
        is_b2b: false,
        loyalty_points: 100,
        total_spent: 500,
        last_order_date: new Date().toISOString()
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

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
    try {
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
    } catch (error) {
      throw error;
    }
  },

  async create(customer: Customer) {
    try {
      const customers = await sql`
        INSERT INTO customers (email, first_name, last_name, phone, created_at)
        VALUES (${customer.email}, ${customer.first_name}, ${customer.last_name}, ${customer.phone || null}, NOW())
        RETURNING *
      ` as any[];
      
      const newCustomer = customers[0];
      
      await sql`
        INSERT INTO customer_profiles (customer_id, created_at)
        VALUES (${newCustomer.id}, NOW())
      `;
      
      return newCustomer;
    } catch (error) {
      throw error;
    }
  },

  async update(id: string, updates: Partial<Customer>) {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
        .join(', ');
      
      const customers = await sql`
        UPDATE customers 
        SET ${sql.unsafe(setClause)}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      ` as any[];
      
      return customers[0];
    } catch (error) {
      throw error;
    }
  },

  async search(searchTerm: string, filters: SearchFilters = {}) {
    try {
      let whereConditions = [];
      let params = [];
      
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
    } catch (error) {
      throw error;
    }
  },

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    try {
      const profiles = await sql`
        SELECT * FROM customer_profiles 
        WHERE customer_id = ${customerId}
      ` as any[];
      
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      throw error;
    }
  },

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
        .join(', ');
      
      const profiles = await sql`
        UPDATE customer_profiles 
        SET ${sql.unsafe(setClause)}, updated_at = NOW()
        WHERE customer_id = ${customerId}
        RETURNING *
      ` as any[];
      
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      throw error;
    }
  },

  async addLoyaltyTransaction(transaction: Omit<LoyaltyTransaction, 'id' | 'created_at'>): Promise<LoyaltyTransaction | null> {
    try {
      const transactions = await sql`
        INSERT INTO loyalty_transactions (customer_id, type, points, description, created_at)
        VALUES (${transaction.customer_id}, ${transaction.type}, ${transaction.points}, ${transaction.description}, NOW())
        RETURNING *
      ` as any[];
      
      return transactions.length > 0 ? transactions[0] : null;
    } catch (error) {
      throw error;
    }
  }
};
