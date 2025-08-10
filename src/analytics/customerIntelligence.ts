import type { SalesTransaction } from './revenueAnalytics';

export interface CustomerMetrics {
  customerId: string;
  lifetimeValue: number;
  totalOrders: number;
  averageOrderValue: number;
  firstPurchaseDate: number;
  lastPurchaseDate: number;
  daysSinceLastPurchase: number;
  churnRisk: 'low' | 'medium' | 'high';
  churnScore: number;
  preferredCategories: Array<{ category: string; percentage: number }>;
  segment: 'new' | 'regular' | 'vip' | 'at_risk' | 'churned';
  predictedNextPurchase: number;
  engagementScore: number;
}

export interface CustomerIntelligenceAnalytics {
  totalCustomers: number;
  averageLifetimeValue: number;
  churnRate: number;
  customerSegments: Array<{ segment: string; count: number; percentage: number }>;
  topCustomers: Array<CustomerMetrics>;
  churnRiskDistribution: { low: number; medium: number; high: number };
  retentionRate: number;
  newCustomerRate: number;
  reactivationOpportunities: Array<CustomerMetrics>;
}

export class CustomerIntelligenceService {
  private static instance: CustomerIntelligenceService;
  private readonly CUSTOMER_METRICS_KEY = 'risevia_customer_metrics';
  private readonly CUSTOMER_ANALYTICS_KEY = 'risevia_customer_analytics';

  private constructor() {}

  public static getInstance(): CustomerIntelligenceService {
    if (!CustomerIntelligenceService.instance) {
      CustomerIntelligenceService.instance = new CustomerIntelligenceService();
    }
    return CustomerIntelligenceService.instance;
  }

  public analyzeCustomer(customerId: string, transactions: SalesTransaction[]): CustomerMetrics {
    const customerTransactions = transactions.filter(t => t.customerId === customerId);
    
    if (customerTransactions.length === 0) {
      return this.createEmptyCustomerMetrics(customerId);
    }

    const lifetimeValue = customerTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = customerTransactions.length;
    const averageOrderValue = lifetimeValue / totalOrders;
    
    const sortedTransactions = customerTransactions.sort((a, b) => a.timestamp - b.timestamp);
    const firstPurchaseDate = sortedTransactions[0].timestamp;
    const lastPurchaseDate = sortedTransactions[sortedTransactions.length - 1].timestamp;
    const daysSinceLastPurchase = Math.floor((Date.now() - lastPurchaseDate) / (24 * 60 * 60 * 1000));

    const churnScore = this.calculateChurnScore(customerTransactions, daysSinceLastPurchase);
    const churnRisk = this.determineChurnRisk(churnScore);
    const preferredCategories = this.analyzePreferredCategories(customerTransactions);
    const segment = this.determineCustomerSegment(lifetimeValue, totalOrders, daysSinceLastPurchase);
    const predictedNextPurchase = this.predictNextPurchase(customerTransactions);
    const engagementScore = this.calculateEngagementScore(customerTransactions, daysSinceLastPurchase);

    return {
      customerId,
      lifetimeValue,
      totalOrders,
      averageOrderValue,
      firstPurchaseDate,
      lastPurchaseDate,
      daysSinceLastPurchase,
      churnRisk,
      churnScore,
      preferredCategories,
      segment,
      predictedNextPurchase,
      engagementScore
    };
  }

  private createEmptyCustomerMetrics(customerId: string): CustomerMetrics {
    return {
      customerId,
      lifetimeValue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      firstPurchaseDate: 0,
      lastPurchaseDate: 0,
      daysSinceLastPurchase: 0,
      churnRisk: 'low',
      churnScore: 0,
      preferredCategories: [],
      segment: 'new',
      predictedNextPurchase: 0,
      engagementScore: 0
    };
  }

  private calculateChurnScore(transactions: SalesTransaction[], daysSinceLastPurchase: number): number {
    const averageDaysBetweenOrders = this.calculateAverageDaysBetweenOrders(transactions);
    const orderFrequencyScore = Math.min(averageDaysBetweenOrders / 30, 1);
    const recencyScore = Math.min(daysSinceLastPurchase / 90, 1);
    const orderCountScore = Math.max(0, 1 - (transactions.length / 10));
    
    return (orderFrequencyScore * 0.4 + recencyScore * 0.4 + orderCountScore * 0.2) * 100;
  }

  private calculateAverageDaysBetweenOrders(transactions: SalesTransaction[]): number {
    if (transactions.length < 2) return 30;
    
    const sortedTransactions = transactions.sort((a, b) => a.timestamp - b.timestamp);
    let totalDays = 0;
    
    for (let i = 1; i < sortedTransactions.length; i++) {
      const daysBetween = (sortedTransactions[i].timestamp - sortedTransactions[i - 1].timestamp) / (24 * 60 * 60 * 1000);
      totalDays += daysBetween;
    }
    
    return totalDays / (sortedTransactions.length - 1);
  }

  private determineChurnRisk(churnScore: number): 'low' | 'medium' | 'high' {
    if (churnScore < 30) return 'low';
    if (churnScore < 70) return 'medium';
    return 'high';
  }

  private analyzePreferredCategories(transactions: SalesTransaction[]): Array<{ category: string; percentage: number }> {
    const categoryCount = new Map<string, number>();
    let totalItems = 0;

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        categoryCount.set(item.category, (categoryCount.get(item.category) || 0) + item.quantity);
        totalItems += item.quantity;
      });
    });

    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        percentage: (count / totalItems) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }

  private determineCustomerSegment(
    lifetimeValue: number, 
    totalOrders: number, 
    daysSinceLastPurchase: number
  ): 'new' | 'regular' | 'vip' | 'at_risk' | 'churned' {
    if (daysSinceLastPurchase > 180) return 'churned';
    if (daysSinceLastPurchase > 90) return 'at_risk';
    if (totalOrders === 1) return 'new';
    if (lifetimeValue > 500 || totalOrders > 10) return 'vip';
    return 'regular';
  }

  private predictNextPurchase(transactions: SalesTransaction[]): number {
    if (transactions.length < 2) return Date.now() + (30 * 24 * 60 * 60 * 1000);
    
    const averageDaysBetweenOrders = this.calculateAverageDaysBetweenOrders(transactions);
    const lastPurchase = Math.max(...transactions.map(t => t.timestamp));
    
    return lastPurchase + (averageDaysBetweenOrders * 24 * 60 * 60 * 1000);
  }

  private calculateEngagementScore(transactions: SalesTransaction[], daysSinceLastPurchase: number): number {
    const orderFrequency = transactions.length / Math.max(1, this.getCustomerLifespanDays(transactions) / 30);
    const recencyScore = Math.max(0, 100 - (daysSinceLastPurchase * 2));
    const varietyScore = new Set(transactions.flatMap(t => t.items.map(i => i.category))).size * 10;
    
    return Math.min(100, (orderFrequency * 30 + recencyScore * 0.5 + varietyScore));
  }

  private getCustomerLifespanDays(transactions: SalesTransaction[]): number {
    if (transactions.length === 0) return 1;
    
    const sortedTransactions = transactions.sort((a, b) => a.timestamp - b.timestamp);
    const firstPurchase = sortedTransactions[0].timestamp;
    const lastPurchase = sortedTransactions[sortedTransactions.length - 1].timestamp;
    
    return Math.max(1, (lastPurchase - firstPurchase) / (24 * 60 * 60 * 1000));
  }

  public getCustomerIntelligenceAnalytics(transactions: SalesTransaction[]): CustomerIntelligenceAnalytics {
    const uniqueCustomers = [...new Set(transactions.map(t => t.customerId))];
    const customerMetrics = uniqueCustomers.map(customerId => 
      this.analyzeCustomer(customerId, transactions)
    );

    const totalCustomers = customerMetrics.length;
    const averageLifetimeValue = customerMetrics.reduce((sum, c) => sum + c.lifetimeValue, 0) / totalCustomers;
    
    const churnedCustomers = customerMetrics.filter(c => c.segment === 'churned').length;
    const churnRate = (churnedCustomers / totalCustomers) * 100;
    
    const segmentCounts = this.calculateSegmentDistribution(customerMetrics);
    const topCustomers = customerMetrics
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 20);
    
    const churnRiskDistribution = this.calculateChurnRiskDistribution(customerMetrics);
    const retentionRate = this.calculateRetentionRate(customerMetrics);
    const newCustomerRate = this.calculateNewCustomerRate(customerMetrics);
    const reactivationOpportunities = customerMetrics
      .filter(c => c.segment === 'at_risk' && c.lifetimeValue > 100)
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 10);

    return {
      totalCustomers,
      averageLifetimeValue,
      churnRate,
      customerSegments: segmentCounts,
      topCustomers,
      churnRiskDistribution,
      retentionRate,
      newCustomerRate,
      reactivationOpportunities
    };
  }

  private calculateSegmentDistribution(customerMetrics: CustomerMetrics[]): Array<{ segment: string; count: number; percentage: number }> {
    const segmentCounts = new Map<string, number>();
    
    customerMetrics.forEach(customer => {
      segmentCounts.set(customer.segment, (segmentCounts.get(customer.segment) || 0) + 1);
    });

    const total = customerMetrics.length;
    return Array.from(segmentCounts.entries()).map(([segment, count]) => ({
      segment,
      count,
      percentage: (count / total) * 100
    }));
  }

  private calculateChurnRiskDistribution(customerMetrics: CustomerMetrics[]): { low: number; medium: number; high: number } {
    const distribution = { low: 0, medium: 0, high: 0 };
    
    customerMetrics.forEach(customer => {
      distribution[customer.churnRisk]++;
    });

    return distribution;
  }

  private calculateRetentionRate(customerMetrics: CustomerMetrics[]): number {
    const activeCustomers = customerMetrics.filter(c => 
      c.segment !== 'churned' && c.daysSinceLastPurchase <= 90
    ).length;
    
    return (activeCustomers / customerMetrics.length) * 100;
  }

  private calculateNewCustomerRate(customerMetrics: CustomerMetrics[]): number {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const newCustomers = customerMetrics.filter(c => 
      c.firstPurchaseDate >= thirtyDaysAgo
    ).length;
    
    return (newCustomers / customerMetrics.length) * 100;
  }

  public generateCustomerRetentionReport(): {
    atRiskCustomers: CustomerMetrics[];
    reactivationTargets: CustomerMetrics[];
    loyaltyOpportunities: CustomerMetrics[];
    churnPrevention: Array<{ customerId: string; recommendedAction: string; priority: 'high' | 'medium' | 'low' }>;
  } {
    const transactions = this.getStoredTransactions();
    const uniqueCustomers = [...new Set(transactions.map(t => t.customerId))];
    const customerMetrics = uniqueCustomers.map(customerId => 
      this.analyzeCustomer(customerId, transactions)
    );

    const atRiskCustomers = customerMetrics
      .filter(c => c.churnRisk === 'high' && c.segment !== 'churned')
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    const reactivationTargets = customerMetrics
      .filter(c => c.segment === 'churned' && c.lifetimeValue > 200)
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    const loyaltyOpportunities = customerMetrics
      .filter(c => c.segment === 'regular' && c.lifetimeValue > 300)
      .sort((a, b) => b.engagementScore - a.engagementScore);

    const churnPrevention = atRiskCustomers.map(customer => ({
      customerId: customer.customerId,
      recommendedAction: this.getRecommendedAction(customer),
      priority: customer.lifetimeValue > 500 ? 'high' as const : 
               customer.lifetimeValue > 200 ? 'medium' as const : 'low' as const
    }));

    return {
      atRiskCustomers,
      reactivationTargets,
      loyaltyOpportunities,
      churnPrevention
    };
  }

  private getRecommendedAction(customer: CustomerMetrics): string {
    if (customer.daysSinceLastPurchase > 60) {
      return 'Send personalized re-engagement email with discount';
    }
    if (customer.averageOrderValue < 50) {
      return 'Offer bundle deals to increase order value';
    }
    if (customer.preferredCategories.length > 0) {
      return `Recommend new ${customer.preferredCategories[0].category} products`;
    }
    return 'Send loyalty program invitation';
  }

  private getStoredTransactions(): SalesTransaction[] {
    try {
      const stored = localStorage.getItem('risevia_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public clearAnalytics(): void {
    localStorage.removeItem(this.CUSTOMER_METRICS_KEY);
    localStorage.removeItem(this.CUSTOMER_ANALYTICS_KEY);
    console.log('🗑️ Cleared all customer intelligence data');
  }
}

export const customerIntelligence = CustomerIntelligenceService.getInstance();
