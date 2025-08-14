/**
 * Browser-Safe Authentication Utility
 * Handles token storage and validation in the browser
 * All JWT operations and API calls are handled by authService
 */

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'employee';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export interface AuthHeaders {
  Authorization?: string;
  [key: string]: string | undefined;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'risevia_access_token';
const REFRESH_TOKEN_KEY = 'risevia_refresh_token';
const USER_KEY = 'risevia_user';

// Rate limit cleanup interval ID
let rateLimitCleanupInterval: NodeJS.Timeout | null = null;

/**
 * Store access token in localStorage
 */
export function storeAccessToken(token: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to store access token:', error);
  }
}

/**
 * Store refresh token in localStorage
 */
export function storeRefreshToken(token: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
}

/**
 * Store user data in localStorage
 */
export function storeUser(user: User): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
}

/**
 * Get user data from localStorage
 */
export function getStoredUser(): User | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Parse JWT token payload (without verification - for display only)
 * WARNING: This does NOT verify the token signature. Only use for non-security UI purposes.
 */
export function parseTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse token payload:', error);
    return null;
  }
}

/**
 * Check if token is expired (based on exp claim)
 * WARNING: This does NOT verify the token. Only checks expiration time.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseTokenPayload(token);
    if (!payload || !payload.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return true;
  }
}

/**
 * Store auth tokens and user data after successful authentication
 */
export function storeAuthData(authResult: AuthResult): void {
  if (authResult.token) {
    storeAccessToken(authResult.token);
  }
  
  if (authResult.refreshToken) {
    storeRefreshToken(authResult.refreshToken);
  }
  
  if (authResult.user) {
    storeUser(authResult.user);
  }
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): AuthHeaders {
  const token = getAccessToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting for authentication attempts (client-side only)
 */
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    rateLimitStore.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - record.lastAttempt > windowMs) {
    rateLimitStore.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    return false;
  }

  // Increment attempts
  record.attempts++;
  record.lastAttempt = now;
  return true;
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.lastAttempt > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Start rate limit cleanup interval
 */
export function startRateLimitCleanup(): void {
  if (rateLimitCleanupInterval) {
    return; // Already running
  }
  
  // Clean up rate limit records every 5 minutes
  rateLimitCleanupInterval = setInterval(cleanupRateLimit, 5 * 60 * 1000);
}

/**
 * Stop rate limit cleanup interval
 */
export function stopRateLimitCleanup(): void {
  if (rateLimitCleanupInterval) {
    clearInterval(rateLimitCleanupInterval);
    rateLimitCleanupInterval = null;
  }
}

/**
 * Generate secure verification token (client-side)
 */
export function generateVerificationToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initialize auth utilities
 * Call this when the app starts
 */
export function initializeAuth(): void {
  startRateLimitCleanup();
}

/**
 * Cleanup auth utilities
 * Call this when the app unmounts
 */
export function cleanupAuth(): void {
  stopRateLimitCleanup();
  rateLimitStore.clear();
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.first_name) {
    return user.first_name;
  }
  
  return user.email.split('@')[0];
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: User['role']): boolean {
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is employee
 */
export function isEmployee(user: User | null): boolean {
  return hasRole(user, 'employee');
}

/**
 * Check if user is customer
 */
export function isCustomer(user: User | null): boolean {
  return hasRole(user, 'customer');
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = parseTokenPayload(token);
    if (!payload || !payload.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = (payload.exp - now) * 1000;
    
    return timeLeft > 0 ? timeLeft : 0;
  } catch (error) {
    console.error('Failed to get token expiration time:', error);
    return null;
  }
}

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export function shouldRefreshToken(token: string): boolean {
  const expirationTime = getTokenExpirationTime(token);
  if (expirationTime === null) return true;
  
  // Refresh if less than 5 minutes left
  return expirationTime < 5 * 60 * 1000;
}
