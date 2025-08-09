import { sql } from '../lib/neon';

export interface AnalyticsMetrics {
  salesMetrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
  };
  productMetrics: {
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
    categoryPerformance: Array<{ category: string; sales: number }>;
  };
  complianceMetrics: {
    ageVerificationRate: number;
    stateBlockRate: number;
    complianceScore: number;
  };
}

export const analyticsAPI = {
  async getSalesMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics['salesMetrics']> {
    const orders = await sql`
      SELECT total_amount, status, created_at FROM orders 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    const completedOrders = orders?.filter((o: any) => o.status === 'completed') || [];
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const sessions = await sql`
      SELECT COUNT(DISTINCT session_token) as unique_sessions 
      FROM wishlist_sessions 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    const uniqueSessions = sessions?.[0]?.unique_sessions || 1;
    const conversionRate = (totalOrders / uniqueSessions) * 100;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate
    };
  },

  async getCustomerMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics['customerMetrics']> {
    const customers = await sql`
      SELECT c.id, c.created_at, cp.loyalty_points as lifetime_value, 
             COALESCE((SELECT COUNT(*) FROM orders WHERE customer_id = c.id), 0) as total_orders
      FROM customers c
      LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
      WHERE c.created_at >= ${startDate} AND c.created_at <= ${endDate}
    `;

    const totalCustomers = customers?.length || 0;
    const newCustomers = customers?.filter((c: any) => 
      new Date(c.created_at) >= new Date(startDate)
    ).length || 0;
    const returningCustomers = customers?.filter((c: any) => 
      c.total_orders > 1
    ).length || 0;

    const customerLifetimeValue = totalCustomers > 0 ? (customers?.reduce((sum: number, c: any) => 
      sum + (c.lifetime_value || 0), 0
    ) || 0) / totalCustomers : 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerLifetimeValue
    };
  },

  async getProductMetrics(): Promise<AnalyticsMetrics['productMetrics']> {
    const wishlistItems = await sql`
      SELECT wi.product_id, COUNT(*) as popularity 
      FROM wishlist_items wi
      GROUP BY wi.product_id 
      ORDER BY popularity DESC 
      LIMIT 10
    `;

    const topProducts = wishlistItems?.map((item: any) => ({
      name: `Product ${item.product_id}`,
      sales: item.popularity,
      revenue: item.popularity * 50
    })) || [];

    const categoryData = await sql`
      SELECT 'flower' as category, COUNT(*) as sales FROM wishlist_items
      UNION ALL
      SELECT 'edibles' as category, COUNT(*) as sales FROM wishlist_items
      UNION ALL  
      SELECT 'concentrates' as category, COUNT(*) as sales FROM wishlist_items
    `;

    const categoryPerformance = categoryData?.map((cat: any) => ({
      category: cat.category,
      sales: cat.sales
    })) || [];

    return {
      topProducts,
      categoryPerformance
    };
  },

  async getComplianceMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics['complianceMetrics']> {
    const complianceEvents = await sql`
      SELECT event_type, compliance_result, risk_score 
      FROM compliance_events 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    const totalEvents = complianceEvents?.length || 0;
    const ageVerifications = complianceEvents?.filter((e: any) => e.event_type === 'age_verification') || [];
    const stateBlocks = complianceEvents?.filter((e: any) => e.event_type === 'state_block') || [];
    
    const ageVerificationRate = ageVerifications.filter((e: any) => e.compliance_result).length / ageVerifications.length * 100 || 0;
    const stateBlockRate = stateBlocks.filter((e: any) => !e.compliance_result).length / totalEvents * 100 || 0;
    
    const averageRiskScore = totalEvents > 0 ? (complianceEvents?.reduce((sum: number, e: any) => sum + e.risk_score, 0) || 0) / totalEvents : 0;
    const complianceScore = (1 - averageRiskScore) * 100;

    return {
      ageVerificationRate,
      stateBlockRate,
      complianceScore
    };
  }
};
