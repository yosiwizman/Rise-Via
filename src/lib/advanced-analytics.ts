/**
 * Advanced Analytics Engine
 * Real-time business intelligence and predictive analytics
 */

import { sql } from './neon';

export interface AnalyticsDashboard {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    customerLifetimeValue: number;
  };
  trends: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    periodComparison: 'week' | 'month' | 'quarter';
  };
  topMetrics: {
    topProducts: Array<{ product_id: string; name: string; revenue: number; units_sold: number }>;
    topCategories: Array<{ category: string; revenue: number; order_count: number }>;
    topCustomers: Array<{ customer_id: string; email: string; total_spent: number; order_count: number }>;
  };
  realTimeMetrics: {
    activeUsers: number;
    cartAbandonment: number;
    currentRevenue: number;
    ordersToday: number;
  };
}

export interface PredictiveAnalytics {
  demandForecast: Array<{
    product_id: string;
    product_name: string;
    predicted_demand: number;
    confidence_interval: { lower: number; upper: number };
    forecast_period: string;
  }>;
  customerChurnPrediction: Array<{
    customer_id: string;
    churn_probability: number;
    risk_factors: string[];
    recommended_actions: string[];
  }>;
  revenueProjection: {
    next_month: number;
    next_quarter: number;
    confidence_score: number;
    growth_factors: string[];
  };
  inventoryOptimization: Array<{
    product_id: string;
    current_stock: number;
    optimal_stock: number;
    reorder_recommendation: boolean;
    cost_impact: number;
  }>;
}

export interface CustomerInsights {
  segmentAnalysis: Array<{
    segment_name: string;
    customer_count: number;
    average_order_value: number;
    lifetime_value: number;
    churn_rate: number;
    growth_rate: number;
  }>;
  behaviorPatterns: {
    peak_shopping_hours: Array<{ hour: number; activity_score: number }>;
    seasonal_trends: Array<{ month: string; revenue_multiplier: number }>;
    device_preferences: Array<{ device_type: string; percentage: number }>;
    payment_preferences: Array<{ payment_method: string; percentage: number }>;
  };
  cohortAnalysis: Array<{
    cohort_month: string;
    customer_count: number;
    retention_rates: number[]; // Month 0, 1, 2, 3, etc.
    revenue_per_cohort: number[];
  }>;
}

export interface MarketingAnalytics {
  campaignPerformance: Array<{
    campaign_id: string;
    campaign_name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    cost_per_acquisition: number;
  }>;
  channelAttribution: Array<{
    channel: string;
    first_touch_conversions: number;
    last_touch_conversions: number;
    assisted_conversions: number;
    revenue_attributed: number;
  }>;
  emailPerformance: {
    total_sent: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
    revenue_per_email: number;
    list_growth_rate: number;
  };
  loyaltyProgramMetrics: {
    active_members: number;
    points_issued: number;
    points_redeemed: number;
    program_roi: number;
    tier_distribution: Array<{ tier: string; count: number; avg_spend: number }>;
  };
}

/**
 * Initialize advanced analytics tables
 */
export async function initializeAdvancedAnalyticsTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping advanced analytics table initialization');
      return;
    }

    // Analytics snapshots table (for historical tracking)
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_date DATE NOT NULL,
        metric_type VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Real-time metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS realtime_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      )
    `;

    // Predictive models table
    await sql`
      CREATE TABLE IF NOT EXISTS predictive_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        model_name VARCHAR(255) NOT NULL,
        model_type VARCHAR(50) NOT NULL,
        algorithm VARCHAR(100) NOT NULL,
        parameters JSONB DEFAULT '{}',
        training_data_period VARCHAR(50),
        accuracy_metrics JSONB DEFAULT '{}',
        last_trained TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customer cohorts table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_cohorts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cohort_month VARCHAR(7) NOT NULL, -- YYYY-MM format
        customer_id UUID NOT NULL,
        first_order_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(cohort_month, customer_id)
      )
    `;

    // Marketing attribution table
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_attribution (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        order_id UUID NOT NULL,
        touchpoint_sequence JSONB NOT NULL,
        first_touch_channel VARCHAR(100),
        last_touch_channel VARCHAR(100),
        conversion_value DECIMAL(10,2) NOT NULL,
        attribution_model VARCHAR(50) DEFAULT 'last_touch',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // A/B test results table
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_name VARCHAR(255) NOT NULL,
        variant VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,4) NOT NULL,
        sample_size INTEGER NOT NULL,
        confidence_level DECIMAL(5,4),
        statistical_significance BOOLEAN DEFAULT false,
        test_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_metric ON analytics_snapshots(metric_type, metric_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_realtime_metrics_name ON realtime_metrics(metric_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_realtime_metrics_timestamp ON realtime_metrics(timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_cohorts_month ON customer_cohorts(cohort_month)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_marketing_attribution_customer ON marketing_attribution(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_results_test ON ab_test_results(test_name, test_date)`;

    console.log('✅ Advanced analytics tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize advanced analytics tables:', error);
  }
}

/**
 * Generate comprehensive analytics dashboard
 */
export async function generateAnalyticsDashboard(
  startDate: string,
  endDate: string,
  compareWithPrevious: boolean = true
): Promise<AnalyticsDashboard> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return getEmptyDashboard();
    }

    // Calculate date ranges
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);
    const prevEnd = new Date(start.getTime() - 1);

    // Get overview metrics
    const overview = await getOverviewMetrics(startDate, endDate);
    
    // Get trends (comparison with previous period)
    const trends = compareWithPrevious 
      ? await getTrendMetrics(startDate, endDate, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0])
      : { revenueGrowth: 0, orderGrowth: 0, customerGrowth: 0, periodComparison: 'week' as const };

    // Get top metrics
    const topMetrics = await getTopMetrics(startDate, endDate);

    // Get real-time metrics
    const realTimeMetrics = await getRealTimeMetrics();

    return {
      overview,
      trends,
      topMetrics,
      realTimeMetrics
    };
  } catch (error) {
    console.error('Failed to generate analytics dashboard:', error);
    return getEmptyDashboard();
  }
}

/**
 * Get overview metrics
 */
async function getOverviewMetrics(startDate: string, endDate: string): Promise<AnalyticsDashboard['overview']> {
  try {
    const metrics = await sql`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.customer_id) as total_customers,
        COALESCE(SUM(o.total), 0) as total_revenue,
        COALESCE(AVG(o.total), 0) as average_order_value
      FROM orders o
      WHERE o.created_at BETWEEN ${startDate} AND ${endDate}
      AND o.status NOT IN ('cancelled')
    ` as Array<{
      total_orders: number;
      total_customers: number;
      total_revenue: number;
      average_order_value: number;
    }>;

    const stats = metrics[0] || { total_orders: 0, total_customers: 0, total_revenue: 0, average_order_value: 0 };

    // Calculate conversion rate (simplified)
    const conversionRate = await sql`
      SELECT 
        COUNT(DISTINCT cb.session_id) as total_sessions,
        COUNT(DISTINCT o.customer_id) as converted_customers
      FROM customer_behavior cb
      LEFT JOIN orders o ON cb.customer_id = o.customer_id 
        AND o.created_at BETWEEN ${startDate} AND ${endDate}
      WHERE cb.timestamp BETWEEN ${startDate} AND ${endDate}
    ` as Array<{ total_sessions: number; converted_customers: number }>;

    const conversionStats = conversionRate[0] || { total_sessions: 1, converted_customers: 0 };
    const conversion = conversionStats.total_sessions > 0 
      ? (conversionStats.converted_customers / conversionStats.total_sessions) * 100 
      : 0;

    // Calculate customer lifetime value (simplified)
    const clvData = await sql`
      SELECT AVG(customer_total) as avg_clv
      FROM (
        SELECT customer_id, SUM(total) as customer_total
        FROM orders
        WHERE status NOT IN ('cancelled')
        GROUP BY customer_id
      ) customer_totals
    ` as Array<{ avg_clv: number }>;

    const customerLifetimeValue = clvData[0]?.avg_clv || 0;

    return {
      totalRevenue: stats.total_revenue,
      totalOrders: stats.total_orders,
      totalCustomers: stats.total_customers,
      averageOrderValue: stats.average_order_value,
      conversionRate: Math.round(conversion * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100
    };
  } catch (error) {
    console.error('Failed to get overview metrics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      customerLifetimeValue: 0
    };
  }
}

/**
 * Get trend metrics (growth compared to previous period)
 */
async function getTrendMetrics(
  currentStart: string,
  currentEnd: string,
  prevStart: string,
  prevEnd: string
): Promise<AnalyticsDashboard['trends']> {
  try {
    const currentMetrics = await sql`
      SELECT 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders,
        COUNT(DISTINCT customer_id) as customers
      FROM orders
      WHERE created_at BETWEEN ${currentStart} AND ${currentEnd}
      AND status NOT IN ('cancelled')
    ` as Array<{ revenue: number; orders: number; customers: number }>;

    const prevMetrics = await sql`
      SELECT 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders,
        COUNT(DISTINCT customer_id) as customers
      FROM orders
      WHERE created_at BETWEEN ${prevStart} AND ${prevEnd}
      AND status NOT IN ('cancelled')
    ` as Array<{ revenue: number; orders: number; customers: number }>;

    const current = currentMetrics[0] || { revenue: 0, orders: 0, customers: 0 };
    const previous = prevMetrics[0] || { revenue: 1, orders: 1, customers: 1 }; // Avoid division by zero

    const revenueGrowth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
    const orderGrowth = ((current.orders - previous.orders) / previous.orders) * 100;
    const customerGrowth = ((current.customers - previous.customers) / previous.customers) * 100;

    return {
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      orderGrowth: Math.round(orderGrowth * 100) / 100,
      customerGrowth: Math.round(customerGrowth * 100) / 100,
      periodComparison: 'week'
    };
  } catch (error) {
    console.error('Failed to get trend metrics:', error);
    return {
      revenueGrowth: 0,
      orderGrowth: 0,
      customerGrowth: 0,
      periodComparison: 'week'
    };
  }
}

/**
 * Get top metrics (products, categories, customers)
 */
async function getTopMetrics(startDate: string, endDate: string): Promise<AnalyticsDashboard['topMetrics']> {
  try {
    // Top products
    const topProducts = await sql`
      SELECT 
        oi.product_id,
        oi.product_name,
        SUM(oi.quantity * oi.price) as revenue,
        SUM(oi.quantity) as units_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN ${startDate} AND ${endDate}
      AND o.status NOT IN ('cancelled')
      GROUP BY oi.product_id, oi.product_name
      ORDER BY revenue DESC
      LIMIT 10
    ` as Array<{ product_id: string; product_name: string; revenue: number; units_sold: number }>;

    // Top categories
    const topCategories = await sql`
      SELECT 
        p.category,
        SUM(oi.quantity * oi.price) as revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at BETWEEN ${startDate} AND ${endDate}
      AND o.status NOT IN ('cancelled')
      GROUP BY p.category
      ORDER BY revenue DESC
      LIMIT 10
    ` as Array<{ category: string; revenue: number; order_count: number }>;

    // Top customers
    const topCustomers = await sql`
      SELECT 
        o.customer_id,
        u.email,
        SUM(o.total) as total_spent,
        COUNT(o.id) as order_count
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.created_at BETWEEN ${startDate} AND ${endDate}
      AND o.status NOT IN ('cancelled')
      GROUP BY o.customer_id, u.email
      ORDER BY total_spent DESC
      LIMIT 10
    ` as Array<{ customer_id: string; email: string; total_spent: number; order_count: number }>;

    return {
      topProducts: topProducts || [],
      topCategories: topCategories || [],
      topCustomers: topCustomers || []
    };
  } catch (error) {
    console.error('Failed to get top metrics:', error);
    return {
      topProducts: [],
      topCategories: [],
      topCustomers: []
    };
  }
}

/**
 * Get real-time metrics
 */
async function getRealTimeMetrics(): Promise<AnalyticsDashboard['realTimeMetrics']> {
  try {
    // Active users (last 30 minutes)
    const activeUsers = await sql`
      SELECT COUNT(DISTINCT session_id) as active_users
      FROM customer_behavior
      WHERE timestamp > NOW() - INTERVAL '30 minutes'
    ` as Array<{ active_users: number }>;

    // Cart abandonment rate (today)
    const cartStats = await sql`
      SELECT 
        COUNT(*) as total_carts,
        COUNT(CASE WHEN recovered = false THEN 1 END) as abandoned_carts
      FROM abandoned_carts
      WHERE abandoned_at >= CURRENT_DATE
    ` as Array<{ total_carts: number; abandoned_carts: number }>;

    // Today's revenue and orders
    const todayStats = await sql`
      SELECT 
        COALESCE(SUM(total), 0) as current_revenue,
        COUNT(*) as orders_today
      FROM orders
      WHERE created_at >= CURRENT_DATE
      AND status NOT IN ('cancelled')
    ` as Array<{ current_revenue: number; orders_today: number }>;

    const activeUsersCount = activeUsers[0]?.active_users || 0;
    const cartData = cartStats[0] || { total_carts: 1, abandoned_carts: 0 };
    const todayData = todayStats[0] || { current_revenue: 0, orders_today: 0 };

    const cartAbandonment = cartData.total_carts > 0 
      ? (cartData.abandoned_carts / cartData.total_carts) * 100 
      : 0;

    return {
      activeUsers: activeUsersCount,
      cartAbandonment: Math.round(cartAbandonment * 100) / 100,
      currentRevenue: todayData.current_revenue,
      ordersToday: todayData.orders_today
    };
  } catch (error) {
    console.error('Failed to get real-time metrics:', error);
    return {
      activeUsers: 0,
      cartAbandonment: 0,
      currentRevenue: 0,
      ordersToday: 0
    };
  }
}

/**
 * Generate predictive analytics
 */
export async function generatePredictiveAnalytics(): Promise<PredictiveAnalytics> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return getEmptyPredictiveAnalytics();
    }

    // Demand forecasting (simplified - based on historical trends)
    const demandForecast = await generateDemandForecast();
    
    // Customer churn prediction (simplified - based on recency)
    const customerChurnPrediction = await generateChurnPrediction();
    
    // Revenue projection (based on trends)
    const revenueProjection = await generateRevenueProjection();
    
    // Inventory optimization
    const inventoryOptimization = await generateInventoryOptimization();

    return {
      demandForecast,
      customerChurnPrediction,
      revenueProjection,
      inventoryOptimization
    };
  } catch (error) {
    console.error('Failed to generate predictive analytics:', error);
    return getEmptyPredictiveAnalytics();
  }
}

/**
 * Generate demand forecast
 */
async function generateDemandForecast(): Promise<PredictiveAnalytics['demandForecast']> {
  try {
    // Simplified demand forecasting based on historical sales trends
    const historicalData = await sql`
      SELECT 
        oi.product_id,
        oi.product_name,
        DATE_TRUNC('week', o.created_at) as week,
        SUM(oi.quantity) as weekly_demand
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at > NOW() - INTERVAL '12 weeks'
      AND o.status NOT IN ('cancelled')
      GROUP BY oi.product_id, oi.product_name, DATE_TRUNC('week', o.created_at)
      ORDER BY oi.product_id, week
    ` as Array<{ product_id: string; product_name: string; week: string; weekly_demand: number }>;

    // Group by product and calculate trend
    const productDemand = new Map<string, { name: string; demands: number[] }>();
    
    historicalData.forEach(row => {
      if (!productDemand.has(row.product_id)) {
        productDemand.set(row.product_id, { name: row.product_name, demands: [] });
      }
      productDemand.get(row.product_id)!.demands.push(row.weekly_demand);
    });

    const forecasts: PredictiveAnalytics['demandForecast'] = [];
    
    productDemand.forEach((data, productId) => {
      if (data.demands.length >= 4) { // Need at least 4 weeks of data
        const avgDemand = data.demands.reduce((sum, d) => sum + d, 0) / data.demands.length;
        const trend = data.demands.length > 1 
          ? (data.demands[data.demands.length - 1] - data.demands[0]) / data.demands.length
          : 0;
        
        const predictedDemand = Math.max(0, avgDemand + trend);
        const variance = data.demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / data.demands.length;
        const stdDev = Math.sqrt(variance);
        
        forecasts.push({
          product_id: productId,
          product_name: data.name,
          predicted_demand: Math.round(predictedDemand),
          confidence_interval: {
            lower: Math.max(0, Math.round(predictedDemand - 1.96 * stdDev)),
            upper: Math.round(predictedDemand + 1.96 * stdDev)
          },
          forecast_period: 'next_week'
        });
      }
    });

    return forecasts.slice(0, 20); // Top 20 products
  } catch (error) {
    console.error('Failed to generate demand forecast:', error);
    return [];
  }
}

/**
 * Generate churn prediction
 */
async function generateChurnPrediction(): Promise<PredictiveAnalytics['customerChurnPrediction']> {
  try {
    // Simplified churn prediction based on recency and frequency
    const customerData = await sql`
      SELECT 
        ca.customer_id,
        ca.email,
        ca.last_order_date,
        ca.total_orders,
        ca.total_spent,
        EXTRACT(DAYS FROM (NOW() - ca.last_order_date)) as days_since_last_order
      FROM customer_analytics ca
      WHERE ca.total_orders > 0
      AND ca.last_order_date IS NOT NULL
      ORDER BY days_since_last_order DESC
      LIMIT 100
    ` as Array<{
      customer_id: string;
      email: string;
      last_order_date: string;
      total_orders: number;
      total_spent: number;
      days_since_last_order: number;
    }>;

    const churnPredictions: PredictiveAnalytics['customerChurnPrediction'] = [];

    customerData.forEach(customer => {
      let churnProbability = 0;
      const riskFactors: string[] = [];
      const recommendedActions: string[] = [];

      // Calculate churn probability based on various factors
      if (customer.days_since_last_order > 90) {
        churnProbability += 0.4;
        riskFactors.push('No orders in 90+ days');
        recommendedActions.push('Send win-back email campaign');
      } else if (customer.days_since_last_order > 60) {
        churnProbability += 0.2;
        riskFactors.push('No orders in 60+ days');
        recommendedActions.push('Send re-engagement email');
      }

      if (customer.total_orders === 1) {
        churnProbability += 0.3;
        riskFactors.push('Only made one purchase');
        recommendedActions.push('Send new customer nurture sequence');
      }

      if (customer.total_spent < 50) {
        churnProbability += 0.1;
        riskFactors.push('Low total spend');
        recommendedActions.push('Offer first-time buyer discount');
      }

      // Cap at 95%
      churnProbability = Math.min(0.95, churnProbability);

      if (churnProbability > 0.3) { // Only include customers with significant churn risk
        churnPredictions.push({
          customer_id: customer.customer_id,
          churn_probability: Math.round(churnProbability * 100) / 100,
          risk_factors: riskFactors,
          recommended_actions: recommendedActions
        });
      }
    });

    return churnPredictions.slice(0, 50); // Top 50 at-risk customers
  } catch (error) {
    console.error('Failed to generate churn prediction:', error);
    return [];
  }
}

/**
 * Generate revenue projection
 */
async function generateRevenueProjection(): Promise<PredictiveAnalytics['revenueProjection']> {
  try {
    // Get monthly revenue for trend analysis
    const monthlyRevenue = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '12 months'
      AND status NOT IN ('cancelled')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    ` as Array<{ month: string; revenue: number }>;

    if (monthlyRevenue.length < 3) {
      return {
        next_month: 0,
        next_quarter: 0,
        confidence_score: 0,
        growth_factors: ['Insufficient historical data']
      };
    }

    // Calculate trend
    const revenues = monthlyRevenue.map(m => m.revenue);
    const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    const trend = revenues.length > 1 
      ? (revenues[revenues.length - 1] - revenues[0]) / revenues.length
      : 0;

    const nextMonthProjection = Math.max(0, avgRevenue + trend);
    const nextQuarterProjection = Math.max(0, nextMonthProjection * 3);

    // Calculate confidence based on trend consistency
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const coefficientOfVariation = Math.sqrt(variance) / avgRevenue;
    const confidenceScore = Math.max(0.1, Math.min(0.95, 1 - coefficientOfVariation));

    const growthFactors = [];
    if (trend > 0) {
      growthFactors.push('Positive revenue trend');
    }
    if (avgRevenue > 10000) {
      growthFactors.push('Strong revenue base');
    }
    growthFactors.push('Based on 12-month historical data');

    return {
      next_month: Math.round(nextMonthProjection),
      next_quarter: Math.round(nextQuarterProjection),
      confidence_score: Math.round(confidenceScore * 100) / 100,
      growth_factors: growthFactors
    };
  } catch (error) {
    console.error('Failed to generate revenue projection:', error);
    return {
      next_month: 0,
      next_quarter: 0,
      confidence_score: 0,
      growth_factors: ['Error in calculation']
    };
  }
}

/**
 * Generate inventory optimization recommendations
 */
async function generateInventoryOptimization(): Promise<PredictiveAnalytics['inventoryOptimization']> {
  try {
    // Get inventory data with sales velocity
    const inventoryData = await sql`
      SELECT 
        ii.product_id,
        ii.quantity_available as current_stock,
        ii.reorder_point,
        COALESCE(sales.weekly_sales, 0) as weekly_sales,
        COALESCE(sales.avg_weekly_sales, 0) as avg_weekly_sales
      FROM inventory_items ii
      LEFT JOIN (
        SELECT 
          oi.product_id,
          SUM(CASE WHEN o.created_at > NOW() - INTERVAL '7 days' THEN oi.quantity ELSE 0 END) as weekly_sales,
          AVG(weekly_totals.weekly_total) as avg_weekly_sales
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN (
          SELECT 
            oi2.product_id,
            DATE_TRUNC('week', o2.created_at) as week,
            SUM(oi2.quantity) as weekly_total
          FROM order_items oi2
          JOIN orders o2 ON oi2.order_id = o2.id
          WHERE o2.created_at > NOW() - INTERVAL '12 weeks'
          AND o2.status NOT IN ('cancelled')
          GROUP BY oi2.product_id, DATE_TRUNC('week', o2.created_at)
        ) weekly_totals ON oi.product_id = weekly_totals.product_id
        WHERE o.status NOT IN ('cancelled')
        GROUP BY oi.product_id
      ) sales ON ii.product_id = sales.product_id
      LIMIT 50
    ` as Array<{
      product_id: string;
      current_stock: number;
      reorder_point: number;
      weekly_sales: number;
      avg_weekly_sales: number;
    }>;

    const optimizations: PredictiveAnalytics['inventoryOptimization'] = [];

    inventoryData.forEach(item => {
      const salesVelocity = item.avg_weekly_sales || 1;
      const weeksOfStock = item.current_stock / salesVelocity;
      
      // Calculate optimal stock (4-6 weeks of inventory)
      const optimalStock = Math.ceil(salesVelocity * 5); // 5 weeks target
      const stockDifference = optimalStock - item.current_stock;
      
      let reorderRecommendation = false;
      let costImpact = 0;

      if (weeksOfStock < 2) {
        reorderRecommendation = true;
        costImpact = stockDifference * 10; // Estimated cost per unit
      } else if (weeksOfStock > 8) {
        costImpact = (item.current_stock - optimalStock) * -5; // Overstock cost
      }

      if (Math.abs(stockDifference) > 5) { // Only include significant recommendations
        optimizations.push({
          product_id: item.product_id,
          current_stock: item.current_stock,
          optimal_stock: optimalStock,
          reorder_recommendation: reorderRecommendation,
          cost_impact: Math.round(costImpact)
        });
      }
    });

    return optimizations.slice(0, 30); // Top 30 recommendations
  } catch (error) {
    console.error('Failed to generate inventory optimization:', error);
    return [];
  }
}

/**
 * Store analytics snapshot for historical tracking
 */
export async function storeAnalyticsSnapshot(
  metricType: string,
  metricName: string,
  metricValue: number,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping analytics snapshot');
      return;
    }

    await sql`
      INSERT INTO analytics_snapshots (snapshot_date, metric_type, metric_name, metric_value, metadata)
      VALUES (CURRENT_DATE, ${metricType}, ${metricName}, ${metricValue}, ${JSON.stringify(metadata)})
      ON CONFLICT (snapshot_date, metric_type, metric_name) 
      DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        metadata = EXCLUDED.metadata
    `;
  } catch (error) {
    console.error('Failed to store analytics snapshot:', error);
  }
}

/**
 * Update real-time metric
 */
export async function updateRealTimeMetric(
  metricName: string,
  metricValue: number,
  ttlMinutes: number = 60
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping real-time metric update');
      return;
    }

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await sql`
      INSERT INTO realtime_metrics (metric_name, metric_value, expires_at)
      VALUES (${metricName}, ${metricValue}, ${expiresAt.toISOString()})
    `;
  } catch (error) {
    console.error('Failed to update real-time metric:', error);
  }
}

/**
 * Clean up expired real-time metrics
 */
export async function cleanupExpiredMetrics(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping metrics cleanup');
      return;
    }

    const deleted = await sql`
      DELETE FROM realtime_metrics WHERE expires_at < NOW()
    `;

    console.log(`Cleaned up ${deleted.length} expired real-time metrics`);
  } catch (error) {
    console.error('Failed to cleanup expired metrics:', error);
  }
}

/**
 * Helper functions for empty data structures
 */
function getEmptyDashboard(): AnalyticsDashboard {
  return {
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      customerLifetimeValue: 0
    },
    trends: {
      revenueGrowth: 0,
      orderGrowth: 0,
      customerGrowth: 0,
      periodComparison: 'week'
    },
    topMetrics: {
      topProducts: [],
      topCategories: [],
      topCustomers: []
    },
    realTimeMetrics: {
      activeUsers: 0,
      cartAbandonment: 0,
      currentRevenue: 0,
      ordersToday: 0
    }
  };
}

function getEmptyPredictiveAnalytics(): PredictiveAnalytics {
  return {
    demandForecast: [],
    customerChurnPrediction: [],
    revenueProjection: {
      next_month: 0,
      next_quarter: 0,
      confidence_score: 0,
      growth_factors: []
    },
    inventoryOptimization: []
  };
}

// Initialize advanced analytics tables on module load
initializeAdvancedAnalyticsTables();

// Clean up expired metrics every hour
setInterval(cleanupExpiredMetrics, 60 * 60 * 1000);