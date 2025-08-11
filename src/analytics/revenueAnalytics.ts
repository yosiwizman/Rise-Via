
export interface RevenueMetrics {
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueByProduct: Array<{ productId: string; productName: string; revenue: number; orders: number }>;
  revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  profitMargins: {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
  };
  trends: {
    revenueGrowth: number;
    orderGrowth: number;
    avgOrderValueGrowth: number;
  };
  seasonalData: Array<{
    period: string;
    revenue: number;
    orders: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface SalesTransaction {
  id: string;
  timestamp: number;
  customerId: string;
  items: Array<{
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    costOfGoodsSold: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  customerSegment: 'retail' | 'wholesale' | 'premium';
}

export class RevenueAnalyticsService {
  private static instance: RevenueAnalyticsService;
  private readonly TRANSACTIONS_KEY = 'risevia_transactions';
  private readonly REVENUE_METRICS_KEY = 'risevia_revenue_metrics';

  private constructor() {}

  public static getInstance(): RevenueAnalyticsService {
    if (!RevenueAnalyticsService.instance) {
      RevenueAnalyticsService.instance = new RevenueAnalyticsService();
    }
    return RevenueAnalyticsService.instance;
  }

  public recordSale(transaction: SalesTransaction): void {
    try {
      const transactions = this.getTransactions();
      transactions.push(transaction);
      
      if (transactions.length > 10000) {
        transactions.splice(0, transactions.length - 10000);
      }
      
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
      this.updateRevenueMetrics();
      
      console.log('💰 Revenue Analytics: Sale recorded', {
        transactionId: transaction.id,
        total: transaction.total,
        items: transaction.items.length
      });
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  }

  public async getRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      const realMetrics = await this.getRealRevenueMetrics();
      if (realMetrics) {
        return realMetrics;
      }

      const stored = localStorage.getItem(this.REVENUE_METRICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading revenue metrics:', error);
    }

    return this.calculateDefaultMetrics();
  }

  private async getRealRevenueMetrics(): Promise<RevenueMetrics | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error getting real revenue metrics:', error);
      return null;
    }
  }

  private calculateDefaultMetrics(): RevenueMetrics {
    const transactions = this.getTransactions();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const allTimeTransactions = transactions;
    const dailyTransactions = transactions.filter(t => t.timestamp >= oneDayAgo);
    const weeklyTransactions = transactions.filter(t => t.timestamp >= oneWeekAgo);
    const monthlyTransactions = transactions.filter(t => t.timestamp >= oneMonthAgo);

    const totalRevenue = allTimeTransactions.reduce((sum, t) => sum + t.total, 0);
    const dailyRevenue = dailyTransactions.reduce((sum, t) => sum + t.total, 0);
    const weeklyRevenue = weeklyTransactions.reduce((sum, t) => sum + t.total, 0);
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);

    const totalOrders = allTimeTransactions.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueByProduct = this.calculateRevenueByProduct(allTimeTransactions);
    const revenueByCategory = this.calculateRevenueByCategory(allTimeTransactions);
    const profitMargins = this.calculateProfitMargins(allTimeTransactions);
    const trends = this.calculateTrends(transactions);
    const seasonalData = this.calculateSeasonalData(transactions);

    return {
      totalRevenue,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      averageOrderValue,
      totalOrders,
      revenueByProduct,
      revenueByCategory,
      profitMargins,
      trends,
      seasonalData
    };
  }

  private calculateRevenueByProduct(transactions: SalesTransaction[]): Array<{ productId: string; productName: string; revenue: number; orders: number }> {
    const productMap = new Map<string, { productName: string; revenue: number; orders: Set<string> }>();

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = productMap.get(item.productId) || {
          productName: item.productName,
          revenue: 0,
          orders: new Set<string>()
        };
        
        existing.revenue += item.totalPrice;
        existing.orders.add(transaction.id);
        productMap.set(item.productId, existing);
      });
    });

    try {
      const productArray = Array.from(productMap.entries());
      if (!Array.isArray(productArray)) {
        console.warn('⚠️ revenueAnalytics.calculateRevenueByProduct: productArray is not an array:', typeof productArray, productArray);
        return [];
      }
      
      return productArray
        .map(([productId, data]) => ({
          productId,
          productName: data.productName,
          revenue: data.revenue,
          orders: data.orders.size
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20);
    } catch (error) {
      console.error('❌ Error in revenueAnalytics.calculateRevenueByProduct:', error);
      return [];
    }
  }

  private calculateRevenueByCategory(transactions: SalesTransaction[]): Array<{ category: string; revenue: number; percentage: number }> {
    const categoryMap = new Map<string, number>();
    let totalRevenue = 0;

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, existing + item.totalPrice);
        totalRevenue += item.totalPrice;
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private calculateProfitMargins(transactions: SalesTransaction[]): RevenueMetrics['profitMargins'] {
    let totalRevenue = 0;
    let totalCOGS = 0;

    transactions.forEach(transaction => {
      totalRevenue += transaction.total;
      transaction.items.forEach(item => {
        totalCOGS += item.costOfGoodsSold * item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const estimatedOperatingExpenses = totalRevenue * 0.15;
    const netProfit = grossProfit - estimatedOperatingExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      grossProfit,
      grossMargin,
      netProfit,
      netMargin
    };
  }

  private calculateTrends(transactions: SalesTransaction[]): RevenueMetrics['trends'] {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    const currentPeriod = transactions.filter(t => t.timestamp >= thirtyDaysAgo);
    const previousPeriod = transactions.filter(t => t.timestamp >= sixtyDaysAgo && t.timestamp < thirtyDaysAgo);

    const currentRevenue = currentPeriod.reduce((sum, t) => sum + t.total, 0);
    const previousRevenue = previousPeriod.reduce((sum, t) => sum + t.total, 0);
    
    const currentOrders = currentPeriod.length;
    const previousOrders = previousPeriod.length;
    
    const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
    const avgOrderValueGrowth = previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;

    return {
      revenueGrowth,
      orderGrowth,
      avgOrderValueGrowth
    };
  }

  private calculateSeasonalData(transactions: SalesTransaction[]): RevenueMetrics['seasonalData'] {
    const monthlyData = new Map<string, { revenue: number; orders: number }>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyData.get(monthKey) || { revenue: 0, orders: 0 };
      existing.revenue += transaction.total;
      existing.orders += 1;
      monthlyData.set(monthKey, existing);
    });

    let sortedMonths: Array<[string, any]> = [];
    
    try {
      const monthlyArray = Array.from(monthlyData.entries());
      if (!Array.isArray(monthlyArray)) {
        console.warn('⚠️ revenueAnalytics.calculateSeasonalData: monthlyArray is not an array:', typeof monthlyArray, monthlyArray);
        return [];
      }
      
      sortedMonths = monthlyArray
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12);
    } catch (error) {
      console.error('❌ Error in revenueAnalytics.calculateSeasonalData:', error);
      return [];
    }

    return sortedMonths.map(([period, data]: [string, any], index: number) => {
      const previousData = index > 0 ? sortedMonths[index - 1][1] : null;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (previousData) {
        const growth = ((data.revenue - previousData.revenue) / previousData.revenue) * 100;
        if (growth > 5) trend = 'up';
        else if (growth < -5) trend = 'down';
      }

      return {
        period,
        revenue: data.revenue,
        orders: data.orders,
        trend
      };
    });
  }

  private updateRevenueMetrics(): void {
    try {
      const metrics = this.calculateDefaultMetrics();
      localStorage.setItem(this.REVENUE_METRICS_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error updating revenue metrics:', error);
    }
  }

  private getTransactions(): SalesTransaction[] {
    try {
      const stored = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    
    return this.generateSampleTransactions();
  }

  private generateSampleTransactions(): SalesTransaction[] {
    const sampleTransactions: SalesTransaction[] = [];
    const now = Date.now();
    
    const products = [
      { id: '1', name: 'Blue Dream', category: 'sativa', price: 45, cogs: 25 },
      { id: '2', name: 'OG Kush', category: 'indica', price: 50, cogs: 28 },
      { id: '3', name: 'Girl Scout Cookies', category: 'hybrid', price: 48, cogs: 26 },
      { id: '4', name: 'Sour Diesel', category: 'sativa', price: 52, cogs: 30 },
      { id: '5', name: 'Granddaddy Purple', category: 'indica', price: 46, cogs: 24 }
    ];

    for (let i = 0; i < 150; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000);
      
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalPrice = product.price * quantity;
        
        items.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity,
          unitPrice: product.price,
          totalPrice,
          costOfGoodsSold: product.cogs
        });
        
        subtotal += totalPrice;
      }
      
      const tax = subtotal * 0.08;
      const shipping = subtotal > 100 ? 0 : 10;
      const total = subtotal + tax + shipping;
      
      sampleTransactions.push({
        id: `txn_${i + 1}`,
        timestamp,
        customerId: `customer_${Math.floor(Math.random() * 50) + 1}`,
        items,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: ['credit_card', 'debit_card', 'cash'][Math.floor(Math.random() * 3)],
        customerSegment: ['retail', 'wholesale', 'premium'][Math.floor(Math.random() * 3)] as 'retail' | 'wholesale' | 'premium'
      });
    }
    
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(sampleTransactions));
    return sampleTransactions;
  }

  public clearAnalytics(): void {
    localStorage.removeItem(this.TRANSACTIONS_KEY);
    localStorage.removeItem(this.REVENUE_METRICS_KEY);
    console.log('🗑️ Cleared all revenue analytics data');
  }

  public async exportRevenueReport(): Promise<string> {
    const metrics = await this.getRevenueMetrics();
    const transactions = this.getTransactions();
    
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: metrics.totalRevenue,
        totalOrders: metrics.totalOrders,
        averageOrderValue: metrics.averageOrderValue,
        grossMargin: metrics.profitMargins.grossMargin
      },
      trends: metrics.trends,
      topProducts: Array.isArray(metrics.revenueByProduct) ? metrics.revenueByProduct.slice(0, 10) : [],
      categoryBreakdown: metrics.revenueByCategory,
      seasonalData: metrics.seasonalData,
      transactionCount: transactions.length
    }, null, 2);
  }
}

export const revenueAnalytics = RevenueAnalyticsService.getInstance();
