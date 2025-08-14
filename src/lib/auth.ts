/**
 * Browser-Safe Authentication Utility
 * Handles token storage and retrieval in the browser
 * All JWT operations should be performed on the backend
 */

import { sql } from './neon';

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
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'risevia_access_token';
const REFRESH_TOKEN_KEY = 'risevia_refresh_token';
const USER_KEY = 'risevia_user';

/**
 * Store access token in localStorage
 */
export function storeAccessToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store access token:', error);
  }
}

/**
 * Store refresh token in localStorage
 */
export function storeRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
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
    return localStorage.getItem(REFRESH_TOKEN_KEY);
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
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
}

/**
 * Get user data from localStorage
 */
export function getStoredUser(): User | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
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
    if (!payload || !('exp' in payload)) return true;
    
    const exp = (payload as any).exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return true;
  }
}

/**
 * Refresh access token using refresh token
 * This makes an API call to the backend to get a new access token
 */
export async function refreshAccessToken(): Promise<AuthResult> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to refresh token' };
    }

    const data = await response.json();
    
    if (data.token) {
      storeAccessToken(data.token);
    }
    
    if (data.user) {
      storeUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken || refreshToken,
    };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return { success: false, error: 'Failed to refresh token' };
  }
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

// Clean up rate limit records every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

/**
 * Generate secure verification token (client-side)
 */
export function generateVerificationToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store auth tokens and user data after successful login
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
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Login user (API call to backend)
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    // Check rate limiting
    if (!checkRateLimit(email)) {
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Login failed' };
    }

    const data = await response.json();
    
    // Store auth data
    storeAuthData(data);

    return {
      success: true,
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();
    
    // Call backend to revoke refresh token
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local auth data
    clearAuthData();
  }
}

/**
 * Register new user (API call to backend)
 */
export async function register(userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<AuthResult> {
  try {
    // Validate email
    if (!isValidEmail(userData.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Validate password
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Registration failed' };
    }

    const data = await response.json();
    
    // Store auth data
    storeAuthData(data);

    return {
      success: true,
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * Request password reset (API call to backend)
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to request password reset' };
    }

    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Password reset request failed:', error);
    return { success: false, error: 'Failed to request password reset' };
  }
}

/**
 * Reset password with token (API call to backend)
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }

    const response = await fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to reset password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset failed:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

/**
 * Verify email with token (API call to backend)
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to verify email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email verification failed:', error);
    return { success: false, error: 'Failed to verify email' };
  }
}

/**
 * Initialize auth tables (database operations - only if sql is available)
 */
export async function initializeAuthTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping auth table initialization');
      return;
    }

    // Auth logs table
    await sql`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        event VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Email verification tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Password reset tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Refresh tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add email_verified column to users table if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer',
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auth_logs_event ON auth_logs(event)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    console.log('✅ Auth tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize auth tables:', error);
  }
}
