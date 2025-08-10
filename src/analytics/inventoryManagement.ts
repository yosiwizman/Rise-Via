import type { SalesTransaction } from './revenueAnalytics';

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  costPerUnit: number;
  sellPrice: number;
  supplier: string;
  leadTimeDays: number;
  lastRestocked: number;
  averageDailySales: number;
  stockoutRisk: 'low' | 'medium' | 'high';
  turnoverRate: number;
  daysOfInventory: number;
}

export interface InventoryForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: Array<{
    date: string;
    expectedSales: number;
    stockLevel: number;
    reorderNeeded: boolean;
  }>;
  recommendedReorderDate: string;
  recommendedOrderQuantity: number;
  stockoutProbability: number;
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalStockValue: number;
  averageTurnoverRate: number;
  lowStockAlerts: InventoryItem[];
  stockoutRisks: InventoryItem[];
  overStockItems: InventoryItem[];
  reorderRecommendations: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedOrder: number;
    urgency: 'immediate' | 'soon' | 'planned';
  }>;
  supplierPerformance: Array<{
    supplier: string;
    averageLeadTime: number;
    reliability: number;
    totalProducts: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    turnoverRate: number;
    stockValue: number;
    profitMargin: number;
  }>;
}

export class InventoryManagementService {
  private static instance: InventoryManagementService;
  private readonly INVENTORY_KEY = 'risevia_inventory';
  private readonly INVENTORY_ANALYTICS_KEY = 'risevia_inventory_analytics';

  private constructor() {}

  public static getInstance(): InventoryManagementService {
    if (!InventoryManagementService.instance) {
      InventoryManagementService.instance = new InventoryManagementService();
    }
    return InventoryManagementService.instance;
  }

  public getInventoryAnalytics(transactions: SalesTransaction[]): InventoryAnalytics {
    const inventory = this.getInventoryItems();
    const salesData = this.analyzeSalesData(transactions);
    
    const updatedInventory = inventory.map(item => 
      this.updateInventoryMetrics(item, salesData.get(item.productId) || { totalSold: 0, averageDailySales: 0 })
    );

    const totalProducts = updatedInventory.length;
    const totalStockValue = updatedInventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
    const averageTurnoverRate = updatedInventory.reduce((sum, item) => sum + item.turnoverRate, 0) / totalProducts;

    const lowStockAlerts = updatedInventory.filter(item => 
      item.currentStock <= item.reorderPoint
    );

    const stockoutRisks = updatedInventory.filter(item => 
      item.stockoutRisk === 'high' || item.stockoutRisk === 'medium'
    ).sort((a, b) => this.getStockoutRiskScore(b) - this.getStockoutRiskScore(a));

    const overStockItems = updatedInventory.filter(item => 
      item.currentStock > item.maxStock * 0.8 && item.turnoverRate < 2
    );

    const reorderRecommendations = this.generateReorderRecommendations(updatedInventory);
    const supplierPerformance = this.analyzeSupplierPerformance(updatedInventory);
    const categoryPerformance = this.analyzeCategoryPerformance(updatedInventory, transactions);

    return {
      totalProducts,
      totalStockValue,
      averageTurnoverRate,
      lowStockAlerts,
      stockoutRisks,
      overStockItems,
      reorderRecommendations,
      supplierPerformance,
      categoryPerformance
    };
  }

  private analyzeSalesData(transactions: SalesTransaction[]): Map<string, { totalSold: number; averageDailySales: number }> {
    const salesMap = new Map<string, { totalSold: number; dates: Set<string> }>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp).toDateString();
      transaction.items.forEach(item => {
        const existing = salesMap.get(item.productId) || { totalSold: 0, dates: new Set() };
        existing.totalSold += item.quantity;
        existing.dates.add(date);
        salesMap.set(item.productId, existing);
      });
    });

    const result = new Map<string, { totalSold: number; averageDailySales: number }>();
    salesMap.forEach((data, productId) => {
      const daysSelling = Math.max(1, data.dates.size);
      result.set(productId, {
        totalSold: data.totalSold,
        averageDailySales: data.totalSold / daysSelling
      });
    });

    return result;
  }

  private updateInventoryMetrics(
    item: InventoryItem, 
    salesData: { totalSold: number; averageDailySales: number }
  ): InventoryItem {
    const averageDailySales = salesData.averageDailySales;
    const daysOfInventory = averageDailySales > 0 ? item.currentStock / averageDailySales : 999;
    const turnoverRate = salesData.totalSold > 0 ? (salesData.totalSold * 365) / item.currentStock : 0;
    
    const stockoutRisk = this.calculateStockoutRisk(item, averageDailySales);
    const reorderPoint = Math.ceil(averageDailySales * (item.leadTimeDays + 7));

    return {
      ...item,
      averageDailySales,
      daysOfInventory,
      turnoverRate,
      stockoutRisk,
      reorderPoint: Math.max(reorderPoint, item.reorderPoint)
    };
  }

  private calculateStockoutRisk(item: InventoryItem, averageDailySales: number): 'low' | 'medium' | 'high' {
    if (averageDailySales === 0) return 'low';
    
    const daysUntilStockout = item.currentStock / averageDailySales;
    const leadTimeBuffer = item.leadTimeDays + 7;
    
    if (daysUntilStockout <= leadTimeBuffer) return 'high';
    if (daysUntilStockout <= leadTimeBuffer * 1.5) return 'medium';
    return 'low';
  }

  private getStockoutRiskScore(item: InventoryItem): number {
    const riskScores = { high: 3, medium: 2, low: 1 };
    return riskScores[item.stockoutRisk] * item.averageDailySales;
  }

  private generateReorderRecommendations(inventory: InventoryItem[]): Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedOrder: number;
    urgency: 'immediate' | 'soon' | 'planned';
  }> {
    return inventory
      .filter(item => item.currentStock <= item.reorderPoint || item.stockoutRisk !== 'low')
      .map(item => {
        const recommendedOrder = Math.max(
          item.maxStock - item.currentStock,
          item.averageDailySales * 30
        );
        
        let urgency: 'immediate' | 'soon' | 'planned' = 'planned';
        if (item.stockoutRisk === 'high') urgency = 'immediate';
        else if (item.stockoutRisk === 'medium' || item.currentStock <= item.reorderPoint) urgency = 'soon';

        return {
          productId: item.productId,
          productName: item.productName,
          currentStock: item.currentStock,
          recommendedOrder: Math.ceil(recommendedOrder),
          urgency
        };
      })
      .sort((a, b) => {
        const urgencyOrder = { immediate: 3, soon: 2, planned: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
  }

  private analyzeSupplierPerformance(inventory: InventoryItem[]): Array<{
    supplier: string;
    averageLeadTime: number;
    reliability: number;
    totalProducts: number;
  }> {
    const supplierMap = new Map<string, { leadTimes: number[]; products: number }>();
    
    inventory.forEach(item => {
      const existing = supplierMap.get(item.supplier) || { leadTimes: [], products: 0 };
      existing.leadTimes.push(item.leadTimeDays);
      existing.products++;
      supplierMap.set(item.supplier, existing);
    });

    return Array.from(supplierMap.entries()).map(([supplier, data]) => ({
      supplier,
      averageLeadTime: data.leadTimes.reduce((sum, lt) => sum + lt, 0) / data.leadTimes.length,
      reliability: Math.max(0, 100 - (data.leadTimes.reduce((sum, lt) => sum + Math.max(0, lt - 7), 0) / data.leadTimes.length * 10)),
      totalProducts: data.products
    }));
  }

  private analyzeCategoryPerformance(inventory: InventoryItem[], transactions: SalesTransaction[]): Array<{
    category: string;
    turnoverRate: number;
    stockValue: number;
    profitMargin: number;
  }> {
    const categoryMap = new Map<string, {
      items: InventoryItem[];
      revenue: number;
      cost: number;
    }>();

    inventory.forEach(item => {
      const existing = categoryMap.get(item.category) || { items: [], revenue: 0, cost: 0 };
      existing.items.push(item);
      categoryMap.set(item.category, existing);
    });

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const categoryData = categoryMap.get(item.category);
        if (categoryData) {
          categoryData.revenue += item.totalPrice;
          categoryData.cost += item.costOfGoodsSold * item.quantity;
        }
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const turnoverRate = data.items.reduce((sum, item) => sum + item.turnoverRate, 0) / data.items.length;
      const stockValue = data.items.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
      const profitMargin = data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0;

      return {
        category,
        turnoverRate,
        stockValue,
        profitMargin
      };
    });
  }

  public generateInventoryForecast(productId: string, days: number = 30): InventoryForecast {
    const inventory = this.getInventoryItems();
    const item = inventory.find(i => i.productId === productId);
    
    if (!item) {
      throw new Error(`Product ${productId} not found in inventory`);
    }

    const predictedDemand: InventoryForecast['predictedDemand'] = [];
    let currentStock = item.currentStock;
    const dailySales = item.averageDailySales;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const expectedSales = Math.round(dailySales * (0.8 + Math.random() * 0.4));
      currentStock = Math.max(0, currentStock - expectedSales);
      
      predictedDemand.push({
        date,
        expectedSales,
        stockLevel: currentStock,
        reorderNeeded: currentStock <= item.reorderPoint
      });
    }

    const stockoutDay = predictedDemand.find(d => d.stockLevel === 0);
    const stockoutProbability = stockoutDay ? 
      (days - predictedDemand.indexOf(stockoutDay)) / days * 100 : 0;

    const reorderDay = predictedDemand.find(d => d.reorderNeeded);
    const recommendedReorderDate = reorderDay ? reorderDay.date : 
      new Date(Date.now() + (item.leadTimeDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    const recommendedOrderQuantity = Math.max(
      item.maxStock - item.currentStock,
      dailySales * (item.leadTimeDays + 14)
    );

    return {
      productId,
      productName: item.productName,
      currentStock: item.currentStock,
      predictedDemand,
      recommendedReorderDate,
      recommendedOrderQuantity: Math.ceil(recommendedOrderQuantity),
      stockoutProbability
    };
  }

  private getInventoryItems(): InventoryItem[] {
    try {
      const stored = localStorage.getItem(this.INVENTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
    
    return this.generateSampleInventory();
  }

  private generateSampleInventory(): InventoryItem[] {
    const sampleInventory: InventoryItem[] = [
      {
        productId: '1',
        productName: 'Blue Dream',
        category: 'sativa',
        currentStock: 45,
        reorderPoint: 20,
        maxStock: 100,
        costPerUnit: 25,
        sellPrice: 45,
        supplier: 'Premium Cannabis Co.',
        leadTimeDays: 7,
        lastRestocked: Date.now() - (15 * 24 * 60 * 60 * 1000),
        averageDailySales: 2.5,
        stockoutRisk: 'low',
        turnoverRate: 12,
        daysOfInventory: 18
      },
      {
        productId: '2',
        productName: 'OG Kush',
        category: 'indica',
        currentStock: 12,
        reorderPoint: 15,
        maxStock: 80,
        costPerUnit: 28,
        sellPrice: 50,
        supplier: 'West Coast Growers',
        leadTimeDays: 10,
        lastRestocked: Date.now() - (25 * 24 * 60 * 60 * 1000),
        averageDailySales: 1.8,
        stockoutRisk: 'high',
        turnoverRate: 8,
        daysOfInventory: 7
      },
      {
        productId: '3',
        productName: 'Girl Scout Cookies',
        category: 'hybrid',
        currentStock: 67,
        reorderPoint: 25,
        maxStock: 120,
        costPerUnit: 26,
        sellPrice: 48,
        supplier: 'Premium Cannabis Co.',
        leadTimeDays: 7,
        lastRestocked: Date.now() - (8 * 24 * 60 * 60 * 1000),
        averageDailySales: 3.2,
        stockoutRisk: 'low',
        turnoverRate: 15,
        daysOfInventory: 21
      },
      {
        productId: '4',
        productName: 'Sour Diesel',
        category: 'sativa',
        currentStock: 23,
        reorderPoint: 18,
        maxStock: 90,
        costPerUnit: 30,
        sellPrice: 52,
        supplier: 'Northern Farms',
        leadTimeDays: 14,
        lastRestocked: Date.now() - (20 * 24 * 60 * 60 * 1000),
        averageDailySales: 1.5,
        stockoutRisk: 'medium',
        turnoverRate: 6,
        daysOfInventory: 15
      },
      {
        productId: '5',
        productName: 'Granddaddy Purple',
        category: 'indica',
        currentStock: 8,
        reorderPoint: 12,
        maxStock: 70,
        costPerUnit: 24,
        sellPrice: 46,
        supplier: 'Purple Valley Farms',
        leadTimeDays: 12,
        lastRestocked: Date.now() - (30 * 24 * 60 * 60 * 1000),
        averageDailySales: 1.2,
        stockoutRisk: 'high',
        turnoverRate: 5,
        daysOfInventory: 7
      }
    ];
    
    localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(sampleInventory));
    return sampleInventory;
  }

  public updateStock(productId: string, newStock: number): void {
    try {
      const inventory = this.getInventoryItems();
      const itemIndex = inventory.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        inventory[itemIndex].currentStock = newStock;
        inventory[itemIndex].lastRestocked = Date.now();
        localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(inventory));
        
        console.log(`📦 Inventory Updated: ${inventory[itemIndex].productName} stock set to ${newStock}`);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }

  public clearAnalytics(): void {
    localStorage.removeItem(this.INVENTORY_KEY);
    localStorage.removeItem(this.INVENTORY_ANALYTICS_KEY);
    console.log('🗑️ Cleared all inventory analytics data');
  }
}

export const inventoryManagement = InventoryManagementService.getInstance();
