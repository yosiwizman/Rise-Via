/**
 * Email Service Implementation
 * Browser-safe email service that communicates with backend API
 */

import { API_ENDPOINTS, buildRequestUrl, withTimeout } from '../config/api';
import { getAuthHeader } from '../lib/auth';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  created_at: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
}

const emailService = {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/welcome'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ to, name })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send welcome email' }));
        throw new Error(error.message || 'Failed to send welcome email');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send welcome email' 
      };
    }
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string, 
    orderData: { 
      orderNumber: string; 
      total: number;
      items?: Array<{ name: string; quantity: number; price: number }>;
      estimatedDelivery?: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/order-confirmation'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ to, orderData })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send order confirmation' }));
        throw new Error(error.message || 'Failed to send order confirmation');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send order confirmation' 
      };
    }
  },

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    to: string, 
    orderData: { orderNumber: string; total: number }, 
    newStatus: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/order-status'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ to, orderData, newStatus })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send order status update' }));
        throw new Error(error.message || 'Failed to send order status update');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order status update:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send order status update' 
      };
    }
  },

  /**
   * Send shipping notification email
   */
  async sendShippingNotification(
    to: string,
    shippingData: {
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/shipping'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ to, shippingData })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send shipping notification' }));
        throw new Error(error.message || 'Failed to send shipping notification');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send shipping notification' 
      };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/password-reset'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, resetToken })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send password reset email' }));
        throw new Error(error.message || 'Failed to send password reset email');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send password reset email' 
      };
    }
  },

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, name: string, token: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/verification'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ to, name, token })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send verification email' }));
        throw new Error(error.message || 'Failed to send verification email');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send verification email' 
      };
    }
  },

  /**
   * Send generic email
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/send'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ to, subject, body })
        })
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  /**
   * Get email logs from backend
   */
  async getEmailLogs(limit: number = 50): Promise<EmailLog[]> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl(`/api/email/logs?limit=${limit}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch email logs');
      }

      const data = await response.json();
      return data.logs || [];
    } catch (error) {
      console.error('Failed to get email logs:', error);
      return [];
    }
  },

  /**
   * Get email template from backend
   */
  async getEmailTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl(`/api/email/templates/${encodeURIComponent(name)}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        })
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch email template');
      }

      const data = await response.json();
      return data.template || null;
    } catch (error) {
      console.error('Failed to get email template:', error);
      return null;
    }
  },

  /**
   * Create or update email template
   */
  async saveEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at'>): Promise<{ success: boolean; template?: EmailTemplate; error?: string }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/templates'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(template)
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to save template' }));
        throw new Error(error.message || 'Failed to save email template');
      }

      const data = await response.json();
      return { success: true, template: data.template };
    } catch (error) {
      console.error('Failed to save email template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save email template' 
      };
    }
  },

  /**
   * Delete email template
   */
  async deleteEmailTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl(`/api/email/templates/${templateId}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete template' }));
        throw new Error(error.message || 'Failed to delete email template');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete email template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete email template' 
      };
    }
  },

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await withTimeout(
        fetch(buildRequestUrl('/api/email/test'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ email: testEmail })
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Test failed' }));
        throw new Error(error.message || 'Email configuration test failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email configuration test failed' 
      };
    }
  },

  /**
   * Get email statistics
   */
  async getEmailStatistics(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byDay: Array<{ date: string; count: number }>;
  } | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await withTimeout(
        fetch(buildRequestUrl(`/api/email/statistics?${params.toString()}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch email statistics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get email statistics:', error);
      return null;
    }
  }
};

export { emailService };
export default emailService;
