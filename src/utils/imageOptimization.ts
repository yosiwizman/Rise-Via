import type { WishlistItem } from '../types/wishlist';

interface PriceCheckResult {
  itemId: string;
  currentPrice: number;
  targetPrice: number;
  priceDropped: boolean;
  percentageChange: number;
}

class PriceTrackingService {
  private static instance: PriceTrackingService;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'risevia-price-alerts';

  private constructor() {
    this.startPriceTracking();
  }

  public static getInstance(): PriceTrackingService {
    if (!PriceTrackingService.instance) {
      PriceTrackingService.instance = new PriceTrackingService();
    }
    return PriceTrackingService.instance;
  }

  public startPriceTracking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.checkInterval = setInterval(() => {
      this.checkAllPriceAlerts();
    }, this.CHECK_INTERVAL_MS);
    // No console.log
  }

  public stopPriceTracking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    // No console.log
  }

  private async checkAllPriceAlerts(): Promise<void> {
    try {
      const wishlistData = localStorage.getItem('risevia-wishlist');
      if (!wishlistData) return;
      const { state } = JSON.parse(wishlistData);
      const itemsWithAlerts = state.items.filter((item: WishlistItem) => 
        item.priceAlert && item.priceAlert.isActive
      );
      if (itemsWithAlerts.length === 0) return;
      const priceCheckResults = await Promise.all(
        itemsWithAlerts.map((item: WishlistItem) => this.checkItemPrice(item))
      );
      const triggeredAlerts = priceCheckResults.filter(result => result.priceDropped);
      if (triggeredAlerts.length > 0) {
        triggeredAlerts.forEach(alert => {
          this.triggerPriceAlert(alert);
        });
      }
      this.logPriceCheckActivity(priceCheckResults);
    } catch {
      // Silent fail per code standards
    }
  }

  private async checkItemPrice(item: WishlistItem): Promise<PriceCheckResult> {
    const currentPrice = this.simulatePriceChange(item.price, item.priceAlert!.targetPrice);
    const targetPrice = item.priceAlert!.targetPrice;
    const priceDropped = currentPrice <= targetPrice;
    const percentageChange = ((currentPrice - item.price) / item.price) * 100;
    return {
      itemId: item.id,
      currentPrice,
      targetPrice,
      priceDropped,
      percentageChange
    };
  }

  private simulatePriceChange(originalPrice: number, targetPrice: number): number {
    const volatility = 0.1; // 10% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = originalPrice * (1 + randomChange);
    if (Math.random() < 0.05) {
      return targetPrice * (0.95 + Math.random() * 0.05); // Slightly below target
    }
    return Math.max(newPrice, 0.01); // Ensure price doesn't go negative
  }

  private triggerPriceAlert(result: PriceCheckResult): void {
    const alertData = {
      itemId: result.itemId,
      currentPrice: result.currentPrice,
      targetPrice: result.targetPrice,
      percentageChange: result.percentageChange,
      triggeredAt: Date.now()
    };
    this.storeTriggeredAlert(alertData);
    void this.showBrowserNotification(alertData);
    this.trackPriceAlertEvent('triggered', alertData);
  }

  private storeTriggeredAlert(alertData: Record<string, unknown>): void {
    try {
      const existingAlerts = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      existingAlerts.push(alertData);
      if (existingAlerts.length > 100) {
        existingAlerts.splice(0, existingAlerts.length - 100);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingAlerts));
    } catch {
      // Silent fail
    }
  }

  private async showBrowserNotification(alertData: Record<string, unknown>): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('RiseViA Price Alert! 🎯', {
        body: `Your target price has been reached! Current price: $${(alertData.currentPrice as number).toFixed(2)}`,
        icon: '/risevia-logo.png',
        tag: `price-alert-${alertData.itemId}`,
        requireInteraction: true
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        void this.showBrowserNotification(alertData);
      }
    }
  }

  private logPriceCheckActivity(results: PriceCheckResult[]): void {
    const activity = {
      timestamp: Date.now(),
      itemsChecked: results.length,
      alertsTriggered: results.filter(r => r.priceDropped).length,
      averagePriceChange: results.reduce((sum, r) => sum + r.percentageChange, 0) / results.length,
      results: results.map(r => ({
        itemId: r.itemId,
        priceDropped: r.priceDropped,
        percentageChange: r.percentageChange
      }))
    };
    const existingActivity = JSON.parse(localStorage.getItem('price-check-activity') || '[]');
    existingActivity.push(activity);
    if (existingActivity.length > 50) {
      existingActivity.splice(0, existingActivity.length - 50);
    }
    localStorage.setItem('price-check-activity', JSON.stringify(existingActivity));
  }

  private trackPriceAlertEvent(action: string, data: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', `price_alert_${action}`, {
        event_category: 'price_alerts',
        event_label: data.itemId,
        value: data.currentPrice,
        custom_parameters: {
          target_price: data.targetPrice,
          percentage_change: data.percentageChange
        }
      });
    }
    const analyticsData = {
      action,
      timestamp: Date.now(),
      ...data
    };
    const existingAnalytics = JSON.parse(localStorage.getItem('price-alert-analytics') || '[]');
    existingAnalytics.push(analyticsData);
    if (existingAnalytics.length > 1000) {
      existingAnalytics.splice(0, existingAnalytics.length - 1000);
    }
    localStorage.setItem('price-alert-analytics', JSON.stringify(existingAnalytics));
  }

  public getTriggeredAlerts(): Record<string, unknown>[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  public getPriceCheckActivity(): Record<string, unknown>[] {
    try {
      return JSON.parse(localStorage.getItem('price-check-activity') || '[]');
    } catch {
      return [];
    }
  }

  public clearTriggeredAlerts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    triggeredToday: number;
    averageResponseTime: number;
  } {
    try {
      const wishlistData = localStorage.getItem('risevia-wishlist');
      const triggeredAlerts = this.getTriggeredAlerts();
      let activeAlerts = 0;
      if (wishlistData) {
        const { state } = JSON.parse(wishlistData);
        activeAlerts = state.items.filter((item: WishlistItem) => 
          item.priceAlert && item.priceAlert.isActive
        ).length;
      }
      const today = new Date().toDateString();
      const triggeredToday = triggeredAlerts.filter(alert => 
        new Date(alert.triggeredAt as number).toDateString() === today
      ).length;
      return {
        totalAlerts: triggeredAlerts.length,
        activeAlerts,
        triggeredToday,
        averageResponseTime: this.CHECK_INTERVAL_MS / 1000 // in seconds
      };
    } catch {
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        triggeredToday: 0,
        averageResponseTime: 0
      };
    }
  }
}

export const priceTrackingService = PriceTrackingService.getInstance();
