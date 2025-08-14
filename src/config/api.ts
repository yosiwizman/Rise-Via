/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Environment-based configuration
const getEnvironmentConfig = (): ApiConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'https://api.risevia.com',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      };
    case 'staging':
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'https://staging-api.risevia.com',
        timeout: 30000,
        retryAttempts: 2,
        retryDelay: 500
      };
    default:
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
        timeout: 60000,
        retryAttempts: 1,
        retryDelay: 0
      };
  }
};

export const apiConfig = getEnvironmentConfig();

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
    status: '/api/auth/status',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
    passwordReset: {
      request: '/api/auth/password-reset/request',
      confirm: '/api/auth/password-reset/confirm'
    },
    profile: '/api/auth/profile',
    changePassword: '/api/auth/change-password',
    deleteAccount: '/api/auth/delete-account'
  },
  customers: '/api/customers',
  products: '/api/products',
  orders: '/api/orders',
  wishlist: '/api/wishlist',
  cart: '/api/cart'
} as const;

// Request configuration builder
export const buildRequestUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}${endpoint}`;
};

// Request timeout handler
export const withTimeout = (promise: Promise<Response>, timeoutMs: number = apiConfig.timeout): Promise<Response> => {
  return Promise.race([
    promise,
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

// Retry logic for failed requests
export const retryRequest = async (
  requestFn: () => Promise<Response>,
  attempts: number = apiConfig.retryAttempts,
  delay: number = apiConfig.retryDelay
): Promise<Response> => {
  try {
    return await requestFn();
  } catch (error) {
    if (attempts <= 1) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, attempts - 1, delay * 2);
  }
};
