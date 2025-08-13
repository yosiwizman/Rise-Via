/**
 * Secure Authentication Library
 * Implements JWT-based authentication with proper security measures
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from './neon';

// Get JWT secrets from environment variables
const JWT_SECRET = process.env.VITE_JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.VITE_JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token expires in 7 days

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

/**
 * Generate a secure JWT access token
 */
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'risevia',
    audience: 'risevia-app',
    subject: user.id
  });
}

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'risevia',
    audience: 'risevia-app',
    subject: user.id
  });
}

/**
 * Verify and decode JWT access token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'risevia',
      audience: 'risevia-app'
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token');
    }
    return null;
  }
}

/**
 * Verify and decode JWT refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'risevia',
      audience: 'risevia-app'
    }) as TokenPayload;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid refresh token');
    }
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResult> {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Check if refresh token exists in database and is not revoked
    if (sql) {
      const tokens = await sql`
        SELECT * FROM refresh_tokens 
        WHERE token = ${refreshToken} 
        AND revoked_at IS NULL 
        AND expires_at > NOW()
      `;

      if (tokens.length === 0) {
        return { success: false, error: 'Refresh token not found or revoked' };
      }
    }

    // Get user from database
    if (sql) {
      const users = await sql`
        SELECT * FROM users WHERE id = ${decoded.userId}
      ` as Array<User>;

      if (users.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const user = users[0];

      // Generate new access token
      const newAccessToken = generateToken(user);

      return {
        success: true,
        user,
        token: newAccessToken,
        refreshToken // Return same refresh token
      };
    }

    return { success: false, error: 'Database not available' };
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return { success: false, error: 'Failed to refresh token' };
  }
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping refresh token storage');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await sql`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `;
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping refresh token revocation');
      return;
    }

    await sql`
      UPDATE refresh_tokens 
      SET revoked_at = NOW()
      WHERE token = ${token}
    `;
  } catch (error) {
    console.error('Failed to revoke refresh token:', error);
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping token revocation');
      return;
    }

    await sql`
      UPDATE refresh_tokens 
      SET revoked_at = NOW()
      WHERE user_id = ${userId} AND revoked_at IS NULL
    `;
  } catch (error) {
    console.error('Failed to revoke user tokens:', error);
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
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string): string {
  const payload = {
    userId,
    type: 'password_reset',
    timestamp: Date.now()
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'risevia',
    audience: 'password-reset'
  });
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'risevia',
      audience: 'password-reset'
    }) as any;

    if (decoded.type !== 'password_reset') {
      return null;
    }

    return { userId: decoded.userId };
  } catch (error) {
    console.error('Invalid password reset token:', error);
    return null;
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
 * Clean up expired refresh tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping token cleanup');
      return;
    }

    await sql`
      DELETE FROM refresh_tokens 
      WHERE expires_at < NOW() OR revoked_at IS NOT NULL
    `;

    await sql`
      DELETE FROM email_verification_tokens 
      WHERE expires_at < NOW() OR used_at IS NOT NULL
    `;

    await sql`
      DELETE FROM password_reset_tokens 
      WHERE expires_at < NOW() OR used_at IS NOT NULL
    `;
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

/**
 * Log authentication events for security monitoring
 */
export async function logAuthEvent(
  userId: string | null,
  event: 'login_success' | 'login_failed' | 'logout' | 'password_reset' | 'email_verified' | 'token_refresh',
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
    await sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    console.log('✅ Auth tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize auth tables:', error);
  }
}
