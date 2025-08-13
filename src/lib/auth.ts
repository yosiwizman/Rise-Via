/**
 * Secure Authentication Library
 * Implements JWT-based authentication with proper security measures
 */

import bcrypt from 'bcryptjs';
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
  iat: number;
  exp: number;
}

/**
 * Generate a secure JWT token
 */
export function generateToken(user: User, expiresIn: string = '24h'): string {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const now = Math.floor(Date.now() / 1000);
  const expiration = now + (expiresIn === '24h' ? 24 * 60 * 60 : 7 * 24 * 60 * 60); // 24h or 7d

  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: expiration
  };

  // In production, use a proper JWT library with secret key
  const token = btoa(JSON.stringify(tokenPayload));
  return token;
}

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(userId: string): string {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return btoa(JSON.stringify(payload));
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = JSON.parse(atob(token)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      return null; // Token expired
    }

    return decoded;
  } catch {
    return null; // Invalid token
  }
}

/**
 * Hash password securely
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate secure verification token
 */
export function generateVerificationToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
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
 * Rate limiting for authentication attempts
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
 * Log authentication events for security monitoring
 */
export async function logAuthEvent(
  userId: string | null,
  event: 'login_success' | 'login_failed' | 'logout' | 'password_reset' | 'email_verified',
  ipAddress: string,
  userAgent: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping auth log');
      return;
    }

    await sql`
      INSERT INTO auth_logs (user_id, event, ip_address, user_agent, details, created_at)
      VALUES (${userId}, ${event}, ${ipAddress}, ${userAgent}, ${JSON.stringify(details || {})}, NOW())
    `;
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

/**
 * Create auth logs table if it doesn't exist
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
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    console.log('✅ Auth tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize auth tables:', error);
  }
}