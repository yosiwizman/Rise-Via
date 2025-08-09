export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

export class ErrorHandler {
  private static errorQueue: ErrorDetails[] = [];
  private static maxRetries = 3;
  private static baseDelay = 1000;

  /**
   * Handle and log errors with context
   */
  static handleError(
    error: Error,
    errorInfo?: ErrorInfo,
    context?: Record<string, unknown>
  ): void {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };

    if (import.meta.env.DEV) {
      console.error('Error caught by ErrorHandler:', error);
      console.error('Error details:', errorDetails);
      if (errorInfo?.componentStack) {
        console.error('Component stack:', errorInfo.componentStack);
      }
    }

    this.storeErrorLocally(errorDetails);

    this.queueErrorForRemoteLogging(errorDetails);
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    baseDelay: number = this.baseDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Wrapper function with fallback
   */
  static withFallback<T, F>(
    primaryFn: () => T,
    fallbackFn: () => F,
    errorHandler?: (error: Error) => void
  ): T | F {
    try {
      return primaryFn();
    } catch (error) {
      const err = error as Error;
      errorHandler?.(err);
      this.handleError(err, undefined, { context: 'withFallback' });
      return fallbackFn();
    }
  }

  /**
   * Async wrapper with fallback
   */
  static async withAsyncFallback<T, F>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<F>,
    errorHandler?: (error: Error) => void
  ): Promise<T | F> {
    try {
      return await primaryFn();
    } catch (error) {
      const err = error as Error;
      errorHandler?.(err);
      this.handleError(err, undefined, { context: 'withAsyncFallback' });
      return await fallbackFn();
    }
  }

  /**
   * Store error in localStorage for offline persistence
   */
  private static storeErrorLocally(errorDetails: ErrorDetails): void {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingErrors.push(errorDetails);

      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }

      localStorage.setItem('error_logs', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.warn('Failed to store error locally:', storageError);
    }
  }

  /**
   * Queue error for remote logging
   */
  private static queueErrorForRemoteLogging(errorDetails: ErrorDetails): void {
    this.errorQueue.push(errorDetails);
    
    this.processErrorQueue();
  }

  /**
   * Process error queue (mock implementation)
   */
  private static async processErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrorsToService(errors);
    } catch (error) {
      this.errorQueue.unshift(...errors);
      console.warn('Failed to send errors to logging service:', error);
    }
  }

  /**
   * Mock function to send errors to logging service
   */
  private static async sendErrorsToService(errors: ErrorDetails[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock: Sent ${errors.length} errors to logging service`);
        resolve();
      }, 100);
    });
  }

  /**
   * Get stored errors for debugging
   */
  static getStoredErrors(): ErrorDetails[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  static clearStoredErrors(): void {
    localStorage.removeItem('error_logs');
  }

  /**
   * Network error handler
   */
  static handleNetworkError(error: Error, url: string, method: string = 'GET'): void {
    this.handleError(error, undefined, {
      type: 'network_error',
      url,
      method,
      isOnline: navigator.onLine
    });
  }

  /**
   * API error handler
   */
  static handleAPIError(
    error: Error,
    endpoint: string,
    statusCode?: number,
    responseData?: Record<string, unknown>
  ): void {
    this.handleError(error, undefined, {
      type: 'api_error',
      endpoint,
      statusCode,
      responseData
    });
  }

  /**
   * Component error handler for React Error Boundaries
   */
  static handleComponentError(error: Error, errorInfo: ErrorInfo): void {
    this.handleError(error, errorInfo, {
      type: 'component_error'
    });
  }
}
