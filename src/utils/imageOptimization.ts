export interface ImageSource {
  src: string;
  width: number;
  type?: string;
}

export interface OptimizedImageSources {
  webp: ImageSource[];
  fallback: ImageSource[];
}

export class ImageOptimizer {
  private static readonly BREAKPOINTS = [320, 480, 768, 1024, 1200, 1920];
  private static readonly QUALITY_SETTINGS = {
    thumbnail: 60,
    medium: 75,
    high: 85,
    original: 95
  };

  /**
   * Generate responsive srcSet for different screen sizes
   */
  static generateSrcSet(baseUrl: string, sizes: number[] = this.BREAKPOINTS): string {
    return sizes
      .map(size => `${this.getOptimizedUrl(baseUrl, size)} ${size}w`)
      .join(', ');
  }

  /**
   * Generate WebP and fallback sources for progressive loading
   */
  static getOptimizedImageSources(baseUrl: string, sizes: number[] = this.BREAKPOINTS): OptimizedImageSources {
    const webpSources = sizes.map(size => ({
      src: this.getOptimizedUrl(baseUrl, size, 'webp'),
      width: size,
      type: 'image/webp'
    }));

    const fallbackSources = sizes.map(size => ({
      src: this.getOptimizedUrl(baseUrl, size, 'jpg'),
      width: size,
      type: 'image/jpeg'
    }));

    return {
      webp: webpSources,
      fallback: fallbackSources
    };
  }

  /**
   * Load image progressively with blur-to-sharp effect
   */
  static async loadProgressiveImage(
    lowQualityUrl: string,
    highQualityUrl: string,
    onProgress?: (stage: 'loading' | 'low-quality' | 'high-quality') => void
  ): Promise<{ lowQuality: HTMLImageElement; highQuality: HTMLImageElement }> {
    onProgress?.('loading');

    const lowQualityImg = await this.loadImage(lowQualityUrl);
    onProgress?.('low-quality');

    const highQualityImg = await this.loadImage(highQualityUrl);
    onProgress?.('high-quality');

    return { lowQuality: lowQualityImg, highQuality: highQualityImg };
  }

  /**
   * Get optimized image URL (mock implementation for demo)
   */
  private static getOptimizedUrl(baseUrl: string, width: number, format?: string): string {
    try {
      if (!baseUrl || typeof baseUrl !== 'string') {
        return '';
      }
      
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', this.QUALITY_SETTINGS.medium.toString());
      
      if (format) {
        url.searchParams.set('f', format);
      }
      
      return url.toString();
    } catch (error) {
      console.warn('Failed to construct optimized URL for:', baseUrl, error);
      return baseUrl || '';
    }
  }

  /**
   * Load image and return promise
   */
  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Generate blur placeholder data URL
   */
  static generateBlurPlaceholder(width: number = 40, height: number = 40): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(0.5, '#2a2a2a');
    gradient.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Check if WebP is supported
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Lazy loading intersection observer
   */
  static createLazyLoadObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, defaultOptions);
  }

  /**
   * Preload critical images
   */
  static preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.loadImage(url)));
  }

  /**
   * Calculate optimal image dimensions for container
   */
  static calculateOptimalSize(
    containerWidth: number,
    _containerHeight: number,
    imageAspectRatio: number,
    devicePixelRatio: number = window.devicePixelRatio || 1
  ): { width: number; height: number } {
    const targetWidth = containerWidth * devicePixelRatio;
    
    const optimalWidth = this.BREAKPOINTS.find(bp => bp >= targetWidth) || this.BREAKPOINTS[this.BREAKPOINTS.length - 1];
    const optimalHeight = Math.round(optimalWidth / imageAspectRatio);
    
    return { width: optimalWidth, height: optimalHeight };
  }
}
