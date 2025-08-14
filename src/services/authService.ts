import { 
  isValidEmail,
  validatePassword,
  checkRateLimit,
  generateVerificationToken,
  type User,
  type AuthResult,
  storeAuthData,
  clearAuthData,
  getAuthHeader
} from '../lib/auth';
import { emailService } from './emailService';

// Mock implementation for browser-safe auth service
// All actual authentication happens on the backend via API calls

export const authService = {
  async login(email: string, password: string, ipAddress: string = '', userAgent: string = ''): Promise<AuthResult> {
    try {
      // Client-side rate limiting
      if (!checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
        return { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Make API call to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-IP': ipAddress,
          'X-User-Agent': userAgent
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, error: error.message || 'Invalid email or password' };
      }

      const data = await response.json();
      
      // Store auth data in localStorage
      storeAuthData(data);

      return { 
        success: true, 
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken
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
      // Client-side rate limiting for registration
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

      // Make API call to backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-IP': ipAddress,
          'X-User-Agent': userAgent
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone || null
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        return { success: false, error: error.message || 'An account with this email already exists' };
      }

      const data = await response.json();

      // Don't store auth data for registration (user needs to verify email first)
      
      return { 
        success: true, 
        user: data.user,
        error: 'Account created successfully. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  async logout(token: string, ipAddress: string = '', userAgent: string = ''): Promise<{ success: boolean }> {
    try {
      // Make API call to backend to revoke tokens
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Client-IP': ipAddress,
          'X-User-Agent': userAgent
        }
      }).catch(() => {
        // Ignore logout API errors
      });

      // Always clear local auth data
      clearAuthData();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Always return success for logout
      clearAuthData();
      return { success: true };
    }
  },

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      if (!token) {
        return null;
      }

      // Make API call to backend
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Make API call to backend
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to refresh token' }));
        return { success: false, error: error.message || 'Invalid refresh token' };
      }

      const data = await response.json();
      
      // Store new auth data
      storeAuthData(data);

      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false, error: 'Failed to refresh token' };
    }
  },

  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Make API call to backend
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Verification failed' }));
        return { success: false, error: error.message || 'Invalid verification token' };
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed' };
    }
  },

  async requestPasswordReset(email: string, ipAddress: string = '', userAgent: string = ''): Promise<{ success: boolean; error?: string }> {
    try {
      // Client-side rate limiting
      if (!checkRateLimit(`password_reset_${email}`, 3, 60 * 60 * 1000)) {
        return { success: false, error: 'Too many password reset attempts. Please try again in 1 hour.' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Make API call to backend
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-IP': ipAddress,
          'X-User-Agent': userAgent
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return { success: false, error: error.message || 'Password reset request failed' };
      }

      // Always return success to prevent email enumeration
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

      // Make API call to backend
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-IP': ipAddress,
          'X-User-Agent': userAgent
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Reset failed' }));
        return { success: false, error: error.message || 'Invalid or expired reset token' };
      }

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

      // Make API call to backend
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return { success: false, error: error.message || 'Failed to resend verification email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  },

  // Helper method to check authentication status
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { isAuthenticated: false };
      }

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        clearAuthData();
        return { isAuthenticated: false };
      }

      const data = await response.json();
      return { 
        isAuthenticated: true, 
        user: data.user 
      };
    } catch (error) {
      console.error('Auth status check error:', error);
      return { isAuthenticated: false };
    }
  },

  // Helper method to update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Update failed' }));
        return { success: false, error: error.message || 'Failed to update profile' };
      }

      const data = await response.json();
      
      // Update stored user data
      if (data.user) {
        storeAuthData({ success: true, user: data.user });
      }

      return { 
        success: true, 
        user: data.user 
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Helper method to change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Change failed' }));
        return { success: false, error: error.message || 'Failed to change password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  },

  // Helper method to delete account
  async deleteAccount(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        return { success: false, error: error.message || 'Failed to delete account' };
      }

      // Clear auth data after successful deletion
      clearAuthData();

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }
};
