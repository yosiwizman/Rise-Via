import { sql } from '../lib/neon';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  generateRefreshToken, 
  generateVerificationToken,
  verifyToken,
  isValidEmail,
  validatePassword,
  checkRateLimit,
  logAuthEvent,
  initializeAuthTables,
  type User,
  type AuthResult
} from '../lib/auth';
import { emailService } from './emailService';

// Initialize auth tables on service load
initializeAuthTables();

export const authService = {
  async login(email: string, password: string, ipAddress: string = '', userAgent: string = ''): Promise<AuthResult> {
    try {
      // Rate limiting
      if (!checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
        await logAuthEvent(null, 'login_failed', ipAddress, userAgent, { reason: 'rate_limited', email });
        return { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!sql) {
        console.warn('⚠️ Database not available');
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Get user from database
      const users = await sql`
        SELECT id, email, password_hash, first_name, last_name, phone, role, email_verified, 
               failed_login_attempts, locked_until, created_at, updated_at
        FROM users 
        WHERE email = ${email.toLowerCase()}
      ` as Array<User & { password_hash: string; failed_login_attempts: number; locked_until: string | null }>;
      
      if (users.length === 0) {
        await logAuthEvent(null, 'login_failed', ipAddress, userAgent, { reason: 'user_not_found', email });
        return { success: false, error: 'Invalid email or password' };
      }
      
      const user = users[0];

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        await logAuthEvent(user.id, 'login_failed', ipAddress, userAgent, { reason: 'account_locked' });
        return { success: false, error: 'Account is temporarily locked. Please try again later.' };
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        // Increment failed attempts
        const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
        const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes after 5 failed attempts

        await sql`
          UPDATE users 
          SET failed_login_attempts = ${newFailedAttempts}, 
              locked_until = ${lockUntil?.toISOString() || null}
          WHERE id = ${user.id}
        `;

        await logAuthEvent(user.id, 'login_failed', ipAddress, userAgent, { 
          reason: 'invalid_password', 
          failed_attempts: newFailedAttempts 
        });

        return { success: false, error: 'Invalid email or password' };
      }

      // Check if email is verified
      if (!user.email_verified) {
        return { success: false, error: 'Please verify your email address before logging in' };
      }

      // Reset failed attempts on successful login
      await sql`
        UPDATE users 
        SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW()
        WHERE id = ${user.id}
      `;

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in database
      await sql`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${refreshToken}, ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()})
      `;

      // Log successful login
      await logAuthEvent(user.id, 'login_success', ipAddress, userAgent);

      // Remove sensitive data
      const { password_hash, failed_login_attempts, locked_until, ...safeUser } = user;

      return { 
        success: true, 
        user: safeUser,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  async register(
    email: string, 
    password: string, 
    firstName: string,
    lastName: string,
    phone?: string,
    ipAddress: string = '',
    userAgent: string = ''
  ): Promise<AuthResult> {
    try {
      // Rate limiting for registration
      if (!checkRateLimit(`register_${ipAddress}`, 3, 60 * 60 * 1000)) {
        return { success: false, error: 'Too many registration attempts. Please try again in 1 hour.' };
      }

      // Validate input
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (!firstName.trim() || !lastName.trim()) {
        return { success: false, error: 'First name and last name are required' };
      }

      if (!sql) {
        console.warn('⚠️ Database not available');
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `;

      if (existingUsers.length > 0) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate verification token
      const verificationToken = generateVerificationToken();

      // Create user
      const users = await sql`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified)
        VALUES (${email.toLowerCase()}, ${passwordHash}, ${firstName.trim()}, ${lastName.trim()}, ${phone || null}, 'customer', false)
        RETURNING id, email, first_name, last_name, phone, role, email_verified, created_at, updated_at
      ` as Array<User>;

      if (users.length === 0) {
        return { success: false, error: 'Failed to create account' };
      }

      const user = users[0];

      // Store verification token
      await sql`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${verificationToken}, ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()})
      `;

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, user.first_name || 'User', verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Log registration
      await logAuthEvent(user.id, 'login_success', ipAddress, userAgent, { event: 'registration' });

      return { 
        success: true, 
        user,
        error: 'Account created successfully. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  async logout(token: string, ipAddress: string = '', userAgent: string = ''): Promise<{ success: boolean }> {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        // Revoke refresh token
        if (sql) {
          await sql`
            UPDATE refresh_tokens 
            SET revoked_at = NOW() 
            WHERE user_id = ${decoded.userId} AND revoked_at IS NULL
          `;
        }

        // Log logout
        await logAuthEvent(decoded.userId, 'logout', ipAddress, userAgent);
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true }; // Always return success for logout
    }
  },

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return null;
      }

      if (!sql) {
        console.warn('⚠️ Database not available');
        return null;
      }

      const users = await sql`
        SELECT id, email, first_name, last_name, phone, role, email_verified, created_at, updated_at
        FROM users 
        WHERE id = ${decoded.userId}
      ` as Array<User>;
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      if (!sql) {
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Verify refresh token
      const tokenRecords = await sql`
        SELECT rt.user_id, rt.expires_at, u.email, u.first_name, u.last_name, u.phone, u.role, u.email_verified, u.created_at, u.updated_at
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = ${refreshToken} AND rt.revoked_at IS NULL
      ` as Array<{ user_id: string; expires_at: string } & User>;

      if (tokenRecords.length === 0) {
        return { success: false, error: 'Invalid refresh token' };
      }

      const record = tokenRecords[0];

      // Check if token is expired
      if (new Date(record.expires_at) < new Date()) {
        return { success: false, error: 'Refresh token expired' };
      }

      // Generate new tokens
      const user: User = {
        id: record.user_id,
        email: record.email,
        first_name: record.first_name,
        last_name: record.last_name,
        phone: record.phone,
        role: record.role,
        email_verified: record.email_verified,
        created_at: record.created_at,
        updated_at: record.updated_at
      };

      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user.id);

      // Revoke old refresh token and create new one
      await sql`
        UPDATE refresh_tokens 
        SET revoked_at = NOW() 
        WHERE token = ${refreshToken}
      `;

      await sql`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${newRefreshToken}, ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()})
      `;

      return {
        success: true,
        user,
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false, error: 'Failed to refresh token' };
    }
  },

  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!sql) {
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Find verification token
      const tokenRecords = await sql`
        SELECT user_id, expires_at, used_at
        FROM email_verification_tokens
        WHERE token = ${token}
      ` as Array<{ user_id: string; expires_at: string; used_at: string | null }>;

      if (tokenRecords.length === 0) {
        return { success: false, error: 'Invalid verification token' };
      }

      const record = tokenRecords[0];

      // Check if token is already used
      if (record.used_at) {
        return { success: false, error: 'Verification token already used' };
      }

      // Check if token is expired
      if (new Date(record.expires_at) < new Date()) {
        return { success: false, error: 'Verification token expired' };
      }

      // Mark user as verified and token as used
      await sql`
        UPDATE users 
        SET email_verified = true 
        WHERE id = ${record.user_id}
      `;

      await sql`
        UPDATE email_verification_tokens 
        SET used_at = NOW() 
        WHERE token = ${token}
      `;

      // Log email verification
      await logAuthEvent(record.user_id, 'email_verified', '', '');

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed' };
    }
  },

  async requestPasswordReset(email: string, ipAddress: string = '', userAgent: string = ''): Promise<{ success: boolean; error?: string }> {
    try {
      // Rate limiting
      if (!checkRateLimit(`password_reset_${email}`, 3, 60 * 60 * 1000)) {
        return { success: false, error: 'Too many password reset attempts. Please try again in 1 hour.' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!sql) {
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Check if user exists
      const users = await sql`
        SELECT id, first_name, email_verified
        FROM users 
        WHERE email = ${email.toLowerCase()}
      ` as Array<{ id: string; first_name: string; email_verified: boolean }>;

      // Always return success to prevent email enumeration
      if (users.length === 0) {
        return { success: true };
      }

      const user = users[0];

      // Only send reset email if account is verified
      if (!user.email_verified) {
        return { success: true };
      }

      // Generate reset token
      const resetToken = generateVerificationToken();

      // Store reset token
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${resetToken}, ${new Date(Date.now() + 60 * 60 * 1000).toISOString()})
      `;

      // Send reset email
      try {
        const resetUrl = `${import.meta.env.VITE_APP_URL || 'https://rise-via.vercel.app'}/reset-password?token=${resetToken}`;
        
        await emailService.sendEmail(
          email,
          'Password Reset Request',
          `
            <h1>Password Reset Request</h1>
            <p>Hi ${user.first_name},</p>
            <p>You requested a password reset for your Rise Via account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, you can safely ignore this email.</p>
            <p>The Rise Via Team</p>
          `
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }

      // Log password reset request
      await logAuthEvent(user.id, 'password_reset', ipAddress, userAgent, { event: 'request' });

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Password reset request failed' };
    }
  },

  async resetPassword(token: string, newPassword: string, ipAddress: string = '', userAgent: string = ''): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (!sql) {
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Find reset token
      const tokenRecords = await sql`
        SELECT user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token = ${token}
      ` as Array<{ user_id: string; expires_at: string; used_at: string | null }>;

      if (tokenRecords.length === 0) {
        return { success: false, error: 'Invalid reset token' };
      }

      const record = tokenRecords[0];

      // Check if token is already used
      if (record.used_at) {
        return { success: false, error: 'Reset token already used' };
      }

      // Check if token is expired
      if (new Date(record.expires_at) < new Date()) {
        return { success: false, error: 'Reset token expired' };
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password and mark token as used
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}, failed_login_attempts = 0, locked_until = NULL
        WHERE id = ${record.user_id}
      `;

      await sql`
        UPDATE password_reset_tokens 
        SET used_at = NOW() 
        WHERE token = ${token}
      `;

      // Revoke all refresh tokens for this user
      await sql`
        UPDATE refresh_tokens 
        SET revoked_at = NOW() 
        WHERE user_id = ${record.user_id} AND revoked_at IS NULL
      `;

      // Log password reset
      await logAuthEvent(record.user_id, 'password_reset', ipAddress, userAgent, { event: 'completed' });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  },

  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!sql) {
        return { success: false, error: 'Service temporarily unavailable' };
      }

      // Check if user exists and is not verified
      const users = await sql`
        SELECT id, first_name, email_verified
        FROM users 
        WHERE email = ${email.toLowerCase()}
      ` as Array<{ id: string; first_name: string; email_verified: boolean }>;

      if (users.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const user = users[0];

      if (user.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();

      // Store verification token
      await sql`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${verificationToken}, ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()})
      `;

      // Send verification email
      await emailService.sendVerificationEmail(email, user.first_name || 'User', verificationToken);

      return { success: true };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }
};
