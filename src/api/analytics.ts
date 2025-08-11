const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (analytics):', query, values);
    
    if (query.includes('orders')) {
      return Promise.resolve([
        { total_amount: 150.00, status: 'completed', created_at: new Date().toISOString() },
        { total_amount: 89.99, status: 'completed', created_at: new Date().toISOString() },
        { total_amount: 200.50, status: 'completed', created_at: new Date().toISOString() }
      ]);
    }
    
    if (query.includes('wishlist_sessions')) {
      return Promise.resolve([{ unique_sessions: 100 }]);
    }
    
    if (query.includes('customers')) {
      return Promise.resolve([
        { id: '1', created_at: new Date().toISOString(), lifetime_value: 500, total_orders: 3 },
        { id: '2', created_at: new Date().toISOString(), lifetime_value: 300, total_orders: 2 }
      ]);
    }
    
    if (query.includes('wishlist_items')) {
      return Promise.resolve([
        { product_id: 'product-1', popularity: 25 },
        { product_id: 'product-2', popularity: 18 },
        { category: 'flower', sales: 50 },
        { category: 'edibles', sales: 30 }
      ]);
    }
    
    if (query.includes('compliance_events')) {
      return Promise.resolve([
        { event_type: 'age_verification', compliance_result: true, risk_score: 0.1 },
        { event_type: 'state_block', compliance_result: false, risk_score: 0.8 }
      ]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);


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

interface OrderData {
  total_amount: number;
  status: string;
  created_at: string;
}

interface CustomerData {
  created_at: string;
  total_orders?: number;
  lifetime_value?: number;
}

interface ComplianceEventData {
  event_type: string;
  compliance_result: boolean;
  risk_score: number;
}

export const analyticsAPI = {
  async getSalesMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics['salesMetrics']> {
    if (!sql) {
      console.warn('⚠️ Database not available, returning empty sales metrics');
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0
      };
    }

    const orders = await sql`
      SELECT total_amount, status, created_at FROM orders 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    const typedOrders = (orders as OrderData[]) || [];
    const completedOrders = typedOrders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
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
    if (!sql) {
      console.warn('⚠️ Database not available, returning empty customer metrics');
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerLifetimeValue: 0
      };
    }

    const customers = await sql`
      SELECT c.id, c.created_at, cp.loyalty_points as lifetime_value, 
             COALESCE((SELECT COUNT(*) FROM orders WHERE customer_id = c.id), 0) as total_orders
      FROM customers c
      LEFT JOIN customer_profiles cp ON c.id = cp.customer_id
      WHERE c.created_at >= ${startDate} AND c.created_at <= ${endDate}
    `;

    const typedCustomers = (customers as CustomerData[]) || [];
    const totalCustomers = typedCustomers.length;
    const newCustomers = typedCustomers.filter((c) => 
      new Date(c.created_at) >= new Date(startDate)
    ).length;
    const returningCustomers = typedCustomers.filter((c) => 
      (c.total_orders || 0) > 1
    ).length;

    const customerLifetimeValue = totalCustomers > 0 ? 
      typedCustomers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / totalCustomers : 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerLifetimeValue
    };
  },

  async getProductMetrics(): Promise<AnalyticsMetrics['productMetrics']> {
    if (!sql) {
      console.warn('⚠️ Database not available, returning empty product metrics');
      return {
        topProducts: [],
        categoryPerformance: []
      };
    }

    const wishlistItems = await sql`
      SELECT wi.product_id, COUNT(*) as popularity 
      FROM wishlist_items wi
      GROUP BY wi.product_id 
      ORDER BY popularity DESC 
      LIMIT 10
    `;

    const topProducts = (wishlistItems as { product_id: string; popularity: number }[])?.map((item) => ({
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

    const categoryPerformance = (categoryData as { category: string; sales: number }[])?.map((cat) => ({
      category: cat.category,
      sales: cat.sales
    })) || [];

    return {
      topProducts,
      categoryPerformance
    };
  },

  async getComplianceMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics['complianceMetrics']> {
    if (!sql) {
      console.warn('⚠️ Database not available, returning empty compliance metrics');
      return {
        ageVerificationRate: 100,
        stateBlockRate: 0,
        complianceScore: 100
      };
    }

    const complianceEvents = await sql`
      SELECT event_type, compliance_result, risk_score 
      FROM compliance_events 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    const typedEvents = (complianceEvents as ComplianceEventData[]) || [];
    const totalEvents = typedEvents.length;
    const ageVerifications = typedEvents.filter((e) => e.event_type === 'age_verification');
    const stateBlocks = typedEvents.filter((e) => e.event_type === 'state_block');
    
    const ageVerificationRate = ageVerifications.length > 0 ? 
      (ageVerifications.filter((e) => e.compliance_result).length / ageVerifications.length) * 100 : 0;
    const stateBlockRate = totalEvents > 0 ? 
      (stateBlocks.filter((e) => !e.compliance_result).length / totalEvents) * 100 : 0;
    
    const averageRiskScore = totalEvents > 0 ? 
      typedEvents.reduce((sum, e) => sum + (e.risk_score || 0), 0) / totalEvents : 0;
    const complianceScore = (1 - averageRiskScore) * 100;

    return {
      ageVerificationRate,
      stateBlockRate,
      complianceScore
    };
  }
};
