import { 
  isValidEmail,
  validatePassword,
  checkRateLimit,
  type User,
  type AuthResult,
  type AuthHeaders,
  storeAuthData,
  clearAuthData,
  getAuthHeader,
  getAccessToken,
  getRefreshToken
} from '../lib/auth';
import { API_ENDPOINTS, buildRequestUrl, withTimeout, retryRequest } from '../config/api';

// Active request controllers for cancellation
const activeRequests = new Map<string, AbortController>();

// Request deduplication cache
const pendingRequests = new Map<string, Promise<Response>>();

/**
 * Cancel all active requests
 */
export function cancelAllAuthRequests(): void {
  activeRequests.forEach(controller => controller.abort());
  activeRequests.clear();
  pendingRequests.clear();
}

/**
 * Cancel specific request by key
 */
export function cancelAuthRequest(key: string): void {
  const controller = activeRequests.get(key);
  if (controller) {
    controller.abort();
    activeRequests.delete(key);
  }
  pendingRequests.delete(key);
}

/**
 * Create abort controller for request
 */
function createAbortController(key: string): AbortController {
  // Cancel any existing request with the same key
  cancelAuthRequest(key);
  
  const controller = new AbortController();
  activeRequests.set(key, controller);
  
  return controller;
}

/**
 * Clean up abort controller after request
 */
function cleanupAbortController(key: string): void {
  activeRequests.delete(key);
  pendingRequests.delete(key);
}

/**
 * Check if network is available
 */
function isNetworkAvailable(): boolean {
  return typeof window !== 'undefined' && window.navigator && window.navigator.onLine !== false;
}

/**
 * Make authenticated API request with proper error handling and deduplication
 */
async function makeAuthRequest(
  endpoint: string,
  options: RequestInit,
  requestKey: string,
  enableDeduplication: boolean = false
): Promise<Response> {
  // Check network availability
  if (!isNetworkAvailable()) {
    throw new Error('No network connection available');
  }

  // Check for pending request if deduplication is enabled
  if (enableDeduplication && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  const controller = createAbortController(requestKey);
  
  const requestPromise = (async () => {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl(endpoint), {
          ...options,
          signal: controller.signal
        })
      );
      
      cleanupAbortController(requestKey);
      return response;
    } catch (error) {
      cleanupAbortController(requestKey);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      throw error;
    }
  })();

  // Store promise for deduplication if enabled
  if (enableDeduplication) {
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

/**
 * Retry request with exponential backoff
 */
async function retryWithBackoff(
  fn: () => Promise<Response>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) or cancellation
      if (error instanceof Error && 
          (error.message === 'Request was cancelled' || 
           error.message.includes('4'))) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(
    email: string, 
    password: string, 
    ipAddress: string = '', 
    userAgent: string = ''
  ): Promise<AuthResult> {
    try {
      // Client-side rate limiting
      if (!checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please try again in 15 minutes.' 
        };
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.login,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-IP': ipAddress,
            'X-User-Agent': userAgent
          },
          body: JSON.stringify({ email, password })
        },
        'login',
        true // Enable deduplication for login
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        return { 
          success: false, 
          error: error.message || 'Invalid email or password' 
        };
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
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Login request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  /**
   * Register new user
   */
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
        return { 
          success: false, 
          error: 'Too many registration attempts. Please try again in 1 hour.' 
        };
      }

      // Validate input
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: passwordValidation.errors.join(', ') 
        };
      }

      if (!firstName.trim() || !lastName.trim()) {
        return { 
          success: false, 
          error: 'First name and last name are required' 
        };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.register,
        {
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
        },
        'register'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        return { 
          success: false, 
          error: error.message || 'An account with this email already exists' 
        };
      }

      const data = await response.json();
      
      return { 
        success: true, 
        user: data.user,
        message: 'Account created successfully. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Registration request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  /**
   * Logout user and clear auth data
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const token = getAccessToken();
      
      if (token) {
        // Try to revoke token on backend, but don't wait for response
        makeAuthRequest(
          API_ENDPOINTS.auth.logout,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader()
            }
          },
          'logout'
        ).catch(() => {
          // Ignore logout API errors
        });
      }

      // Always clear local auth data immediately
      clearAuthData();
      
      // Cancel any pending auth requests
      cancelAllAuthRequests();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Always return success for logout
      clearAuthData();
      cancelAllAuthRequests();
      return { success: true };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return null;
      }

      const response = await retryWithBackoff(
        () => makeAuthRequest(
          API_ENDPOINTS.auth.me,
          {
            method: 'GET',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            }
          },
          'getCurrentUser',
          true // Enable deduplication
        ),
        2, // Max 2 retries
        500 // Start with 500ms delay
      );

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

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResult> {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        return { 
          success: false, 
          error: 'No refresh token available' 
        };
      }

      const response = await retryWithBackoff(
        () => makeAuthRequest(
          API_ENDPOINTS.auth.refresh,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          },
          'refreshToken',
          true // Enable deduplication for refresh
        ),
        2, // Max 2 retries
        1000 // Start with 1s delay
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to refresh token' }));
        return { 
          success: false, 
          error: error.message || 'Invalid refresh token' 
        };
      }

      const data = await response.json();
      
      // Store new auth data
      storeAuthData(data);

      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken || refreshToken
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Refresh request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection' };
        }
      }
      
      return { success: false, error: 'Failed to refresh token' };
    }
  },

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.verifyEmail,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        },
        'verifyEmail'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Verification failed' }));
        return { 
          success: false, 
          error: error.message || 'Invalid verification token' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Verification request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Email verification failed' };
    }
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(
    email: string, 
    ipAddress: string = '', 
    userAgent: string = ''
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Client-side rate limiting
      if (!checkRateLimit(`password_reset_${email}`, 3, 60 * 60 * 1000)) {
        return { 
          success: false, 
          error: 'Too many password reset attempts. Please try again in 1 hour.' 
        };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.passwordReset.request,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-IP': ipAddress,
            'X-User-Agent': userAgent
          },
          body: JSON.stringify({ email: email.toLowerCase() })
        },
        'requestPasswordReset'
      );

      if (!response.ok) {
        // Always return success to prevent email enumeration
        console.error('Password reset request failed:', await response.text());
      }

      // Always return success to prevent email enumeration
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Password reset request failed' };
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string, 
    newPassword: string, 
    ipAddress: string = '', 
    userAgent: string = ''
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: passwordValidation.errors.join(', ') 
        };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.passwordReset.confirm,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-IP': ipAddress,
            'X-User-Agent': userAgent
          },
          body: JSON.stringify({ token, newPassword })
        },
        'resetPassword'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Reset failed' }));
        return { 
          success: false, 
          error: error.message || 'Invalid or expired reset token' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Reset request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Password reset failed' };
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.resendVerification,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.toLowerCase() })
        },
        'resendVerification'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        return { 
          success: false, 
          error: error.message || 'Failed to resend verification email' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification email error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Failed to resend verification email' };
    }
  },

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { isAuthenticated: false };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.status,
        {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        },
        'checkAuthStatus',
        true // Enable deduplication
      );

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

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.profile,
        {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        },
        'updateProfile'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Update failed' }));
        return { 
          success: false, 
          error: error.message || 'Failed to update profile' 
        };
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
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Update request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Failed to update profile' };
    }
  },

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: passwordValidation.errors.join(', ') 
        };
      }

      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.changePassword,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPassword, newPassword })
        },
        'changePassword'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Change failed' }));
        return { 
          success: false, 
          error: error.message || 'Failed to change password' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Failed to change password' };
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await makeAuthRequest(
        API_ENDPOINTS.auth.deleteAccount,
        {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        },
        'deleteAccount'
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Delete failed' }));
        return { 
          success: false, 
          error: error.message || 'Failed to delete account' 
        };
      }

      // Clear auth data after successful deletion
      clearAuthData();
      cancelAllAuthRequests();

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Request was cancelled') {
          return { success: false, error: 'Request was cancelled' };
        }
        if (error.message === 'No network connection available') {
          return { success: false, error: 'No internet connection. Please check your network.' };
        }
      }
      
      return { success: false, error: 'Failed to delete account' };
    }
  }
};

// Export cleanup function for use in app unmount
export { cancelAllAuthRequests };
