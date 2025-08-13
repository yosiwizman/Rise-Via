/**
 * Customer Segmentation Engine
 * Advanced customer analytics and segmentation for targeted marketing
 */

import { sql } from './neon';

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customer_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  demographics?: {
    age_range?: { min: number; max: number };
    location?: string[];
    gender?: string[];
  };
  behavioral?: {
    total_orders?: { min?: number; max?: number };
    total_spent?: { min?: number; max?: number };
    last_order_days?: { min?: number; max?: number };
    average_order_value?: { min?: number; max?: number };
    favorite_categories?: string[];
    purchase_frequency?: 'high' | 'medium' | 'low';
  };
  engagement?: {
    email_opens?: { min?: number; max?: number };
    email_clicks?: { min?: number; max?: number };
    website_visits?: { min?: number; max?: number };
    last_activity_days?: { min?: number; max?: number };
  };
  loyalty?: {
    membership_tier?: string[];
    loyalty_points?: { min?: number; max?: number };
    referrals_made?: { min?: number; max?: number };
  };
}

export interface CustomerProfile {
  customer_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  first_order_date?: string;
  favorite_categories: string[];
  membership_tier: string;
  loyalty_points: number;
  referrals_made: number;
  email_opens: number;
  email_clicks: number;
  website_visits: number;
  last_activity_date?: string;
  segments: string[];
  created_at: string;
  updated_at: string;
}

export interface SegmentInsights {
  segment_id: string;
  total_customers: number;
  total_revenue: number;
  average_order_value: number;
  average_lifetime_value: number;
  churn_rate: number;
  engagement_score: number;
  top_products: Array<{ product_id: string; product_name: string; purchase_count: number }>;
  demographics: {
    age_distribution: Array<{ age_range: string; count: number }>;
    location_distribution: Array<{ location: string; count: number }>;
    gender_distribution: Array<{ gender: string; count: number }>;
  };
}

/**
 * Initialize customer segmentation tables
 */
export async function initializeSegmentationTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping segmentation table initialization');
      return;
    }

    // Customer segments table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        criteria JSONB NOT NULL,
        customer_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customer segment memberships table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_segment_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        segment_id UUID NOT NULL,
        assigned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(customer_id, segment_id)
      )
    `;

    // Customer analytics table (materialized view-like table for performance)
    await sql`
      CREATE TABLE IF NOT EXISTS customer_analytics (
        customer_id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(20),
        location JSONB DEFAULT '{}',
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        average_order_value DECIMAL(10,2) DEFAULT 0,
        last_order_date TIMESTAMP,
        first_order_date TIMESTAMP,
        favorite_categories TEXT[] DEFAULT '{}',
        membership_tier VARCHAR(50) DEFAULT 'GREEN',
        loyalty_points INTEGER DEFAULT 0,
        referrals_made INTEGER DEFAULT 0,
        email_opens INTEGER DEFAULT 0,
        email_clicks INTEGER DEFAULT 0,
        website_visits INTEGER DEFAULT 0,
        last_activity_date TIMESTAMP,
        segments TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_segments_active ON customer_segments(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_segment_memberships_customer ON customer_segment_memberships(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_segment_memberships_segment ON customer_segment_memberships(segment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_analytics_email ON customer_analytics(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_analytics_total_spent ON customer_analytics(total_spent)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_analytics_total_orders ON customer_analytics(total_orders)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_analytics_last_order ON customer_analytics(last_order_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_analytics_membership_tier ON customer_analytics(membership_tier)`;

    console.log('✅ Customer segmentation tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize segmentation tables:', error);
  }
}

/**
 * Create customer segment
 */
export async function createCustomerSegment(
  name: string,
  description: string,
  criteria: SegmentCriteria
): Promise<CustomerSegment | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const segments = await sql`
      INSERT INTO customer_segments (name, description, criteria)
      VALUES (${name}, ${description}, ${JSON.stringify(criteria)})
      RETURNING *
    ` as Array<CustomerSegment>;

    if (segments.length > 0) {
      const segment = segments[0];
      // Calculate initial customer count
      await updateSegmentMemberships(segment.id);
      return segment;
    }

    return null;
  } catch (error) {
    console.error('Failed to create customer segment:', error);
    return null;
  }
}

/**
 * Update customer analytics data
 */
export async function updateCustomerAnalytics(customerId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping analytics update');
      return;
    }

    // Get customer basic info
    const customers = await sql`
      SELECT id, email, first_name, last_name, phone, date_of_birth, created_at
      FROM users WHERE id = ${customerId}
    ` as Array<{
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
      date_of_birth?: string;
      created_at: string;
    }>;

    if (customers.length === 0) return;
    const customer = customers[0];

    // Get order statistics
    const orderStats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_spent,
        COALESCE(AVG(total), 0) as average_order_value,
        MIN(created_at) as first_order_date,
        MAX(created_at) as last_order_date
      FROM orders 
      WHERE customer_id = ${customerId} AND status NOT IN ('cancelled')
    ` as Array<{
      total_orders: number;
      total_spent: number;
      average_order_value: number;
      first_order_date?: string;
      last_order_date?: string;
    }>;

    // Get favorite categories
    const categoryStats = await sql`
      SELECT 
        p.category,
        COUNT(*) as purchase_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.customer_id = ${customerId} AND o.status NOT IN ('cancelled')
      GROUP BY p.category
      ORDER BY purchase_count DESC
      LIMIT 5
    ` as Array<{ category: string; purchase_count: number }>;

    // Get customer profile data
    const profileData = await sql`
      SELECT membership_tier, loyalty_points, total_referrals
      FROM customer_profiles 
      WHERE customer_id = ${customerId}
    ` as Array<{
      membership_tier: string;
      loyalty_points: number;
      total_referrals: number;
    }>;

    // Get email engagement stats
    const emailStats = await sql`
      SELECT 
        COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) as email_opens,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as email_clicks
      FROM email_send_logs
      WHERE recipient_email = ${customer.email}
    ` as Array<{ email_opens: number; email_clicks: number }>;

    const stats = orderStats[0] || {
      total_orders: 0,
      total_spent: 0,
      average_order_value: 0,
      first_order_date: null,
      last_order_date: null
    };

    const profile = profileData[0] || {
      membership_tier: 'GREEN',
      loyalty_points: 0,
      total_referrals: 0
    };

    const email = emailStats[0] || {
      email_opens: 0,
      email_clicks: 0
    };

    const favoriteCategories = categoryStats.map(c => c.category);

    // Upsert customer analytics
    await sql`
      INSERT INTO customer_analytics (
        customer_id, email, first_name, last_name, phone, date_of_birth,
        total_orders, total_spent, average_order_value, first_order_date, last_order_date,
        favorite_categories, membership_tier, loyalty_points, referrals_made,
        email_opens, email_clicks, last_activity_date, updated_at
      )
      VALUES (
        ${customerId}, ${customer.email}, ${customer.first_name}, ${customer.last_name}, 
        ${customer.phone}, ${customer.date_of_birth}, ${stats.total_orders}, ${stats.total_spent}, 
        ${stats.average_order_value}, ${stats.first_order_date}, ${stats.last_order_date},
        ${favoriteCategories}, ${profile.membership_tier}, ${profile.loyalty_points}, 
        ${profile.total_referrals}, ${email.email_opens}, ${email.email_clicks}, 
        NOW(), NOW()
      )
      ON CONFLICT (customer_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        date_of_birth = EXCLUDED.date_of_birth,
        total_orders = EXCLUDED.total_orders,
        total_spent = EXCLUDED.total_spent,
        average_order_value = EXCLUDED.average_order_value,
        first_order_date = EXCLUDED.first_order_date,
        last_order_date = EXCLUDED.last_order_date,
        favorite_categories = EXCLUDED.favorite_categories,
        membership_tier = EXCLUDED.membership_tier,
        loyalty_points = EXCLUDED.loyalty_points,
        referrals_made = EXCLUDED.referrals_made,
        email_opens = EXCLUDED.email_opens,
        email_clicks = EXCLUDED.email_clicks,
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = EXCLUDED.updated_at
    `;

    // Update segment memberships
    await updateCustomerSegmentMemberships(customerId);
  } catch (error) {
    console.error('Failed to update customer analytics:', error);
  }
}

/**
 * Update segment memberships for all segments
 */
export async function updateAllSegmentMemberships(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping segment updates');
      return;
    }

    const segments = await sql`
      SELECT id FROM customer_segments WHERE is_active = true
    ` as Array<{ id: string }>;

    for (const segment of segments) {
      await updateSegmentMemberships(segment.id);
    }
  } catch (error) {
    console.error('Failed to update all segment memberships:', error);
  }
}

/**
 * Update segment memberships for a specific segment
 */
export async function updateSegmentMemberships(segmentId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping segment membership update');
      return;
    }

    // Get segment criteria
    const segments = await sql`
      SELECT criteria FROM customer_segments WHERE id = ${segmentId}
    ` as Array<{ criteria: SegmentCriteria }>;

    if (segments.length === 0) return;
    const criteria = segments[0].criteria;

    // Build query based on criteria
    const whereConditions: string[] = [];
    const queryParams: unknown[] = [];

    // Demographics criteria
    if (criteria.demographics?.age_range) {
      const { min, max } = criteria.demographics.age_range;
      if (min !== undefined) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    // Behavioral criteria
    if (criteria.behavioral?.total_orders) {
      const { min, max } = criteria.behavioral.total_orders;
      if (min !== undefined) {
        whereConditions.push(`total_orders >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`total_orders <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    if (criteria.behavioral?.total_spent) {
      const { min, max } = criteria.behavioral.total_spent;
      if (min !== undefined) {
        whereConditions.push(`total_spent >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`total_spent <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    if (criteria.behavioral?.average_order_value) {
      const { min, max } = criteria.behavioral.average_order_value;
      if (min !== undefined) {
        whereConditions.push(`average_order_value >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`average_order_value <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    if (criteria.behavioral?.last_order_days) {
      const { min, max } = criteria.behavioral.last_order_days;
      if (min !== undefined) {
        whereConditions.push(`EXTRACT(DAY FROM (NOW() - last_order_date)) >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`EXTRACT(DAY FROM (NOW() - last_order_date)) <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    if (criteria.behavioral?.favorite_categories && criteria.behavioral.favorite_categories.length > 0) {
      whereConditions.push(`favorite_categories && $${queryParams.length + 1}`);
      queryParams.push(criteria.behavioral.favorite_categories);
    }

    // Loyalty criteria
    if (criteria.loyalty?.membership_tier && criteria.loyalty.membership_tier.length > 0) {
      whereConditions.push(`membership_tier = ANY($${queryParams.length + 1})`);
      queryParams.push(criteria.loyalty.membership_tier);
    }

    if (criteria.loyalty?.loyalty_points) {
      const { min, max } = criteria.loyalty.loyalty_points;
      if (min !== undefined) {
        whereConditions.push(`loyalty_points >= $${queryParams.length + 1}`);
        queryParams.push(min);
      }
      if (max !== undefined) {
        whereConditions.push(`loyalty_points <= $${queryParams.length + 1}`);
        queryParams.push(max);
      }
    }

    // If no criteria, skip
    if (whereConditions.length === 0) return;

    const whereClause = whereConditions.join(' AND ');
    
    // Get customers matching criteria
    const matchingCustomers = await sql`
      SELECT customer_id FROM customer_analytics 
      WHERE ${sql.unsafe(whereClause)}
    `;

    // Clear existing memberships for this segment
    await sql`
      DELETE FROM customer_segment_memberships WHERE segment_id = ${segmentId}
    `;

    // Add new memberships
    if (matchingCustomers.length > 0) {
      const values = matchingCustomers.map((customer: { customer_id: string }) => 
        `('${customer.customer_id}', '${segmentId}')`
      ).join(', ');

      await sql.unsafe(`
        INSERT INTO customer_segment_memberships (customer_id, segment_id)
        VALUES ${values}
      `);
    }

    // Update segment customer count
    await sql`
      UPDATE customer_segments 
      SET customer_count = ${matchingCustomers.length}, updated_at = NOW()
      WHERE id = ${segmentId}
    `;
  } catch (error) {
    console.error('Failed to update segment memberships:', error);
  }
}

/**
 * Update customer segment memberships for a specific customer
 */
export async function updateCustomerSegmentMemberships(customerId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping customer segment update');
      return;
    }

    // Get all active segments
    const segments = await sql`
      SELECT id FROM customer_segments WHERE is_active = true
    ` as Array<{ id: string }>;

    for (const segment of segments) {
      await updateSegmentMemberships(segment.id);
    }

    // Update customer's segment list
    const customerSegments = await sql`
      SELECT s.name
      FROM customer_segment_memberships csm
      JOIN customer_segments s ON csm.segment_id = s.id
      WHERE csm.customer_id = ${customerId} AND s.is_active = true
    ` as Array<{ name: string }>;

    const segmentNames = customerSegments.map(s => s.name);

    await sql`
      UPDATE customer_analytics 
      SET segments = ${segmentNames}, updated_at = NOW()
      WHERE customer_id = ${customerId}
    `;
  } catch (error) {
    console.error('Failed to update customer segment memberships:', error);
  }
}

/**
 * Get customers in a segment
 */
export async function getSegmentCustomers(
  segmentId: string,
  limit: number = 100,
  offset: number = 0
): Promise<CustomerProfile[]> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return [];
    }

    const customers = await sql`
      SELECT ca.*
      FROM customer_analytics ca
      JOIN customer_segment_memberships csm ON ca.customer_id = csm.customer_id
      WHERE csm.segment_id = ${segmentId}
      ORDER BY ca.total_spent DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as Array<CustomerProfile>;

    return customers || [];
  } catch (error) {
    console.error('Failed to get segment customers:', error);
    return [];
  }
}

/**
 * Get segment insights
 */
export async function getSegmentInsights(segmentId: string): Promise<SegmentInsights | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    // Get basic segment stats
    const basicStats = await sql`
      SELECT 
        COUNT(*) as total_customers,
        COALESCE(SUM(ca.total_spent), 0) as total_revenue,
        COALESCE(AVG(ca.average_order_value), 0) as average_order_value,
        COALESCE(AVG(ca.total_spent), 0) as average_lifetime_value
      FROM customer_analytics ca
      JOIN customer_segment_memberships csm ON ca.customer_id = csm.customer_id
      WHERE csm.segment_id = ${segmentId}
    ` as Array<{
      total_customers: number;
      total_revenue: number;
      average_order_value: number;
      average_lifetime_value: number;
    }>;

    if (basicStats.length === 0) return null;
    const stats = basicStats[0];

    // Calculate engagement score (simplified)
    const engagementStats = await sql`
      SELECT 
        AVG(email_opens) as avg_email_opens,
        AVG(email_clicks) as avg_email_clicks,
        AVG(website_visits) as avg_website_visits
      FROM customer_analytics ca
      JOIN customer_segment_memberships csm ON ca.customer_id = csm.customer_id
      WHERE csm.segment_id = ${segmentId}
    ` as Array<{
      avg_email_opens: number;
      avg_email_clicks: number;
      avg_website_visits: number;
    }>;

    const engagement = engagementStats[0] || { avg_email_opens: 0, avg_email_clicks: 0, avg_website_visits: 0 };
    const engagementScore = Math.min(100, (engagement.avg_email_opens * 2 + engagement.avg_email_clicks * 5 + engagement.avg_website_visits) / 10);

    // Get top products for this segment
    const topProducts = await sql`
      SELECT 
        oi.product_id,
        oi.product_name,
        COUNT(*) as purchase_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN customer_segment_memberships csm ON o.customer_id = csm.customer_id
      WHERE csm.segment_id = ${segmentId} AND o.status NOT IN ('cancelled')
      GROUP BY oi.product_id, oi.product_name
      ORDER BY purchase_count DESC
      LIMIT 10
    ` as Array<{ product_id: string; product_name: string; purchase_count: number }>;

    return {
      segment_id: segmentId,
      total_customers: stats.total_customers,
      total_revenue: stats.total_revenue,
      average_order_value: stats.average_order_value,
      average_lifetime_value: stats.average_lifetime_value,
      churn_rate: 0, // Would need more complex calculation
      engagement_score: Math.round(engagementScore * 100) / 100,
      top_products: topProducts || [],
      demographics: {
        age_distribution: [], // Would need more complex calculation
        location_distribution: [], // Would need more complex calculation
        gender_distribution: [] // Would need more complex calculation
      }
    };
  } catch (error) {
    console.error('Failed to get segment insights:', error);
    return null;
  }
}

/**
 * Get predefined segments
 */
export async function createPredefinedSegments(): Promise<void> {
  try {
    const predefinedSegments = [
      {
        name: 'High Value Customers',
        description: 'Customers who have spent over $500 total',
        criteria: {
          behavioral: {
            total_spent: { min: 500 }
          }
        }
      },
      {
        name: 'Frequent Buyers',
        description: 'Customers with 5+ orders',
        criteria: {
          behavioral: {
            total_orders: { min: 5 }
          }
        }
      },
      {
        name: 'New Customers',
        description: 'Customers who made their first purchase in the last 30 days',
        criteria: {
          behavioral: {
            total_orders: { min: 1, max: 2 }
          }
        }
      },
      {
        name: 'At Risk Customers',
        description: 'Customers who haven\'t ordered in 60+ days',
        criteria: {
          behavioral: {
            last_order_days: { min: 60 }
          }
        }
      },
      {
        name: 'VIP Members',
        description: 'Gold and Platinum tier members',
        criteria: {
          loyalty: {
            membership_tier: ['GOLD', 'PLATINUM']
          }
        }
      }
    ];

    for (const segment of predefinedSegments) {
      await createCustomerSegment(segment.name, segment.description, segment.criteria);
    }
  } catch (error) {
    console.error('Failed to create predefined segments:', error);
  }
}

// Initialize segmentation tables on module load
initializeSegmentationTables();