import type { WishlistItem } from '../types/wishlist';

interface ImageSource {
  src: string;
  width: number;
  height?: number;
  type?: string;
}

interface OptimizedImageSources {
  webp: ImageSource[];
  fallback: ImageSource[];
}

export class ImageOptimizer {
  private static webpSupported: boolean | null = null;

  static async supportsWebP(): Promise<boolean> {
    if (this.webpSupported !== null) {
      return this.webpSupported;
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.webpSupported = webP.height === 2;
        resolve(this.webpSupported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  static generateSrcSet(baseUrl: string, sizes: number[] = [320, 480, 768, 1024, 1200, 1920]): string {
    if (!baseUrl || typeof baseUrl !== 'string') return sizes.map(size => ` ${size}w`).join(', ');
    
    return sizes.map(size => {
      const optimizedUrl = this.generateOptimizedUrl(baseUrl, size, 'jpg');
      return `${optimizedUrl} ${size}w`;
    }).join(', ');
  }

  static getOptimizedImageSources(src: string, sizes: number[] = [320, 640, 768, 1024, 1280]): OptimizedImageSources {
    const webpSources = sizes.map(width => ({
      src: this.generateOptimizedUrl(src, width, 'webp'),
      width,
      type: 'image/webp'
    }));

    const fallbackSources = sizes.map(width => ({
      src: this.generateOptimizedUrl(src, width, 'jpg'),
      width,
      type: 'image/jpeg'
    }));

    return {
      webp: webpSources,
      fallback: fallbackSources
    };
  }

  private static generateOptimizedUrl(src: string, width: number, format: string): string {
    if (!src || typeof src !== 'string') {
      return '';
    }
    
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }
    
    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('f', format);
      url.searchParams.set('q', '75');
      return url.toString();
    } catch {
      return src;
    }
  }

  static generateBlurPlaceholder(width: number = 40, height: number = 40): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      return canvas.toDataURL('image/jpeg', 0.1);
    } catch {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
    }
  }

  static createLazyLoadObserver(callback: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit): IntersectionObserver {
    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, defaultOptions);
  }

  static async loadProgressiveImage(
    lowQualityUrl: string,
    highQualityUrl: string,
    onProgress?: (stage: 'loading' | 'low-quality' | 'high-quality') => void
  ): Promise<{ lowQuality: HTMLImageElement; highQuality: HTMLImageElement }> {
    onProgress?.('loading');
    
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

    const lowQuality = await loadImage(lowQualityUrl);
    onProgress?.('low-quality');
    
    const highQuality = await loadImage(highQualityUrl);
    onProgress?.('high-quality');
    
    return { lowQuality, highQuality };
  }

  static async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }));
  }

  static calculateOptimalSize(
    containerWidth: number,
    containerHeight: number,
    aspectRatio: number,
    devicePixelRatio: number = window.devicePixelRatio || 1
  ): { width: number; height: number } {
    const targetWidth = containerWidth * devicePixelRatio;
    const breakpoints = [320, 480, 768, 1024, 1200, 1920];
    
    const optimalWidth = breakpoints.find(bp => bp >= targetWidth) || breakpoints[breakpoints.length - 1];
    const optimalHeight = Math.round(optimalWidth / aspectRatio);
    
    return { width: optimalWidth, height: Math.max(optimalHeight, containerHeight) };
  }
}

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
