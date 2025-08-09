export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class PerformanceMonitor {
  private static metrics: Partial<PerformanceMetrics> = {};

  static init() {
    if (typeof window === 'undefined') return;

    this.measureCLS();
    this.measureFID();
    this.measureLCP();
    this.measureLoadTimes();
  }

  private static measureLoadTimes() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.firstContentfulPaint = fcp.startTime;
      }
    });
  }

  private static measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private static measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private static measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  static getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  static reportMetrics() {
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', metrics);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        custom_parameter_1: 'performance_monitoring',
        load_time: metrics.loadTime,
        fcp: metrics.firstContentfulPaint,
        lcp: metrics.largestContentfulPaint,
        cls: metrics.cumulativeLayoutShift,
        fid: metrics.firstInputDelay
      });
    }
  }
}
