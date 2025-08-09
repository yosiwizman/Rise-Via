import { CartItem } from '../types/cart';

export class CartAnalyticsService {
  private static instance: CartAnalyticsService;
  private readonly ANALYTICS_KEY = 'cart_analytics';
  private readonly METRICS_KEY = 'cart_metrics';

  private constructor() {}

  public static getInstance(): CartAnalyticsService {
    if (!CartAnalyticsService.instance) {
      CartAnalyticsService.instance = new CartAnalyticsService();
    }
    return CartAnalyticsService.instance;
  }

  public trackCartEvent(
    action: 'add' | 'remove' | 'update' | 'clear' | 'checkout_start',
    item?: CartItem,
    metadata?: Record<string, unknown>
  ): void {
    const eventData = {
      action,
      timestamp: Date.now(),
      itemId: item?.id,
      itemName: item?.name,
      itemPrice: item?.price,
      itemCategory: item?.category,
      quantity: item?.quantity,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      ...metadata
    };

    this.storeAnalyticsEvent(eventData);
    this.sendToGoogleAnalytics(eventData);
    console.log('🛒 Cart Analytics Event:', eventData);
  }

  private storeAnalyticsEvent(eventData: Record<string, unknown>): void {
    try {
      const existingEvents = JSON.parse(localStorage.getItem(this.ANALYTICS_KEY) || '[]');
      existingEvents.push(eventData);

      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000);
      }

      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(existingEvents));
    } catch (error) {
      console.error('Error storing cart analytics event:', error);
    }
  }

  private sendToGoogleAnalytics(eventData: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', `cart_${eventData.action}`, {
        event_category: 'cart',
        event_label: eventData.itemName || 'bulk_action',
        value: eventData.itemPrice || 0,
        custom_parameters: {
          item_category: eventData.itemCategory,
          quantity: eventData.quantity,
          session_id: eventData.sessionId,
          user_id: eventData.userId
        }
      });
    }
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

  public clearAnalytics(): void {
    localStorage.removeItem(this.ANALYTICS_KEY);
    localStorage.removeItem(this.METRICS_KEY);
    console.log('🗑️ Cleared all cart analytics data');
  }
}

export const cartAnalytics = CartAnalyticsService.getInstance();
