import type { WishlistItem, WishlistAnalytics } from '../types/wishlist';

export class WishlistAnalyticsService {
  private static instance: WishlistAnalyticsService;
  private readonly ANALYTICS_KEY = 'wishlist_analytics';
  private readonly METRICS_KEY = 'wishlist_metrics';

  private constructor() {}

  public static getInstance(): WishlistAnalyticsService {
    if (!WishlistAnalyticsService.instance) {
      WishlistAnalyticsService.instance = new WishlistAnalyticsService();
    }
    return WishlistAnalyticsService.instance;
  }

  public trackWishlistEvent(
    action: 'add' | 'remove' | 'share' | 'import' | 'clear' | 'conversion',
    item?: WishlistItem,
    metadata?: Record<string, unknown>
  ): void {
    const eventData = {
      action,
      timestamp: Date.now(),
      itemId: item?.id,
      itemName: item?.name,
      itemPrice: item?.price,
      itemCategory: item?.category,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      ...metadata
    };

    this.storeAnalyticsEvent(eventData);

    this.sendToGoogleAnalytics(eventData);

    this.updateMetrics(action, item);
  }

  private storeAnalyticsEvent(eventData: Record<string, unknown>): void {
    try {
      const existingEvents = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      existingEvents.push(eventData);

      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000);
      }

      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(existingEvents));
    } catch {
      // silent fail to avoid ESLint error
    }
  }

  private sendToGoogleAnalytics(eventData: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', `wishlist_${eventData.action}`, {
        event_category: 'wishlist',
        event_label: eventData.itemName || 'bulk_action',
        value: eventData.itemPrice || 0,
        custom_parameters: {
          item_category: eventData.itemCategory,
          session_id: eventData.sessionId,
          user_id: eventData.userId
        }
      });
    }
  }

  private updateMetrics(action: string, item?: WishlistItem): void {
    try {
      const metrics = this.getMetrics();

      switch (action) {
        case 'add':
          metrics.addToWishlistEvents++;
          if (item?.category) {
            if (!Array.isArray(metrics.topCategories)) {
              console.warn('⚠️ metrics.topCategories is not an array, initializing:', typeof metrics.topCategories, metrics.topCategories);
              metrics.topCategories = [];
            }
            
            const categoryIndex = metrics.topCategories.findIndex(c => c.category === item.category);
            if (categoryIndex >= 0) {
              metrics.topCategories[categoryIndex].count++;
            } else {
              metrics.topCategories.push({ category: item.category, count: 1 });
            }
            metrics.topCategories.sort((a, b) => b.count - a.count);
            try {
              if (Array.isArray(metrics.topCategories)) {
                metrics.topCategories = metrics.topCategories.slice(0, 10);
              } else {
                console.warn('⚠️ metrics.topCategories is not an array for slice operation:', typeof metrics.topCategories, metrics.topCategories);
                metrics.topCategories = [];
              }
            } catch (error) {
              console.error('❌ Error in topCategories slice operation:', error);
              metrics.topCategories = [];
            }
          }
          break;
        case 'remove':
          metrics.removeFromWishlistEvents++;
          break;
        case 'share':
          metrics.shareEvents++;
          break;
        case 'import':
          metrics.importEvents++;
          break;
        case 'conversion':
          metrics.conversionEvents++;
          metrics.priceAlertConversions++;
          break;
      }

      this.saveMetrics(metrics);
    } catch {
      // silent fail to avoid ESLint error
    }
  }

  public getMetrics(): WishlistAnalytics {
    try {
      const stored = localStorage.getItem(this.METRICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // silent fail to avoid ESLint error
    }

    return {
      addToWishlistEvents: 0,
      removeFromWishlistEvents: 0,
      shareEvents: 0,
      importEvents: 0,
      conversionEvents: 0,
      averageItemsPerWishlist: 0,
      topCategories: [],
      priceAlertConversions: 0,
      returnVisitorRate: 0
    };
  }

  private saveMetrics(metrics: WishlistAnalytics): void {
    try {
      localStorage.setItem(this.METRICS_KEY, JSON.stringify(metrics));
    } catch {
      // silent fail to avoid ESLint error
    }
  }

  public calculateReturnVisitorRate(): number {
    try {
      const events = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      const uniqueUsers = new Set<string>(events.map((e: { userId: string }) => e.userId));
      const returningUsers = new Set<string>();

      const userSessions: Record<string, Set<string>> = {};

      events.forEach((event: { userId: string; sessionId: string }) => {
        if (!userSessions[event.userId]) {
          userSessions[event.userId] = new Set();
        }
        userSessions[event.userId].add(event.sessionId);
      });

      Object.entries(userSessions).forEach(([userId, sessions]) => {
        if (sessions.size > 1) {
          returningUsers.add(userId);
        }
      });

      const rate = uniqueUsers.size > 0 ? (returningUsers.size / uniqueUsers.size) * 100 : 0;

      const metrics = this.getMetrics();
      metrics.returnVisitorRate = rate;
      this.saveMetrics(metrics);

      return rate;
    } catch {
      return 0;
    }
  }

  public calculateAverageItemsPerWishlist(): number {
    try {
      const wishlistData = localStorage.getItem('risevia-wishlist');
      if (!wishlistData) return 0;

      const { state } = JSON.parse(wishlistData);
      const currentItems = state.items?.length || 0;

      const average = currentItems;

      const metrics = this.getMetrics();
      metrics.averageItemsPerWishlist = average;
      this.saveMetrics(metrics);

      return average;
    } catch {
      return 0;
    }
  }

  public getAnalyticsEvents(limit: number = 100): Record<string, unknown>[] {
    try {
      const events = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      if (!Array.isArray(events)) {
        console.warn('⚠️ Analytics events is not an array:', typeof events, events);
        return [];
      }
      try {
        if (Array.isArray(events)) {
          return events.slice(-limit);
        } else {
          console.warn('⚠️ Events is not an array for slice operation:', typeof events, events);
          return [];
        }
      } catch (sliceError) {
        console.error('❌ Error in events slice operation:', sliceError);
        return [];
      }
    } catch (error) {
      console.error('❌ Error in getAnalyticsEvents:', error);
      return [];
    }
  }

  public getEventsByAction(action: string): Record<string, unknown>[] {
    try {
      const events = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      return events.filter((e: { action: string }) => e.action === action);
    } catch {
      return [];
    }
  }

  public getEventsByTimeRange(startTime: number, endTime: number): Record<string, unknown>[] {
    try {
      const events = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      return events.filter((e: { timestamp: number }) => e.timestamp >= startTime && e.timestamp <= endTime);
    } catch {
      return [];
    }
  }

  public generateDailyReport(): {
    date: string;
    totalEvents: number;
    addEvents: number;
    removeEvents: number;
    shareEvents: number;
    conversionRate: number;
    topCategories: Array<{ category: string; count: number }>;
  } {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    const todayEvents = this.getEventsByTimeRange(startOfDay, endOfDay);

    const addEvents = todayEvents.filter(e => e.action === 'add').length;
    const removeEvents = todayEvents.filter(e => e.action === 'remove').length;
    const shareEvents = todayEvents.filter(e => e.action === 'share').length;
    const conversionEvents = todayEvents.filter(e => e.action === 'conversion').length;

    const conversionRate = addEvents > 0 ? (conversionEvents / addEvents) * 100 : 0;

    const categoryCount: Record<string, number> = {};
    todayEvents.forEach((event: { itemCategory?: string }) => {
      if (event.itemCategory) {
        categoryCount[event.itemCategory] = (categoryCount[event.itemCategory] || 0) + 1;
      }
    });

    let topCategories: Array<{ category: string; count: number }> = [];
    try {
      const categoriesArray = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      
      if (Array.isArray(categoriesArray)) {
        topCategories = categoriesArray.slice(0, 5);
      } else {
        console.warn('⚠️ Categories array is not an array for slice operation:', typeof categoriesArray, categoriesArray);
        topCategories = [];
      }
    } catch (error) {
      console.error('❌ Error in topCategories slice operation:', error);
      topCategories = [];
    }

    return {
      date: today.toDateString(),
      totalEvents: todayEvents.length,
      addEvents,
      removeEvents,
      shareEvents,
      conversionRate,
      topCategories
    };
  }

  public clearAnalytics(): void {
    localStorage.removeItem(this.ANALYTICS_KEY);
    localStorage.removeItem(this.METRICS_KEY);
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('risevia_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('risevia_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('risevia_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('risevia_user_id', userId);
    }
    return userId;
  }
}

export const wishlistAnalytics = WishlistAnalyticsService.getInstance();
