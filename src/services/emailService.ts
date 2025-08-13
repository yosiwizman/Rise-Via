/**
 * Email Service Implementation
 * Handles email sending via Resend API
 */

import { Resend } from 'resend';
import { sql } from '../lib/neon';

// Initialize Resend with API key
const resend = new Resend(process.env.VITE_RESEND_API_KEY || 're_placeholder_key');

// Email configuration
const FROM_EMAIL = process.env.VITE_FROM_EMAIL || 'noreply@risevia.com';
const FROM_NAME = process.env.VITE_FROM_NAME || 'Rise Via';
const REPLY_TO_EMAIL = process.env.VITE_REPLY_TO_EMAIL || 'support@risevia.com';

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

const emailService = {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject: 'Welcome to Rise Via - Your Premium THCA Journey Begins!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to Rise Via!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hi ${name},</p>
              
              <p>Welcome to the Rise Via family! We're thrilled to have you join our community of cannabis enthusiasts.</p>
              
              <p>At Rise Via, we're committed to providing you with the highest quality THCA products, backed by rigorous lab testing and exceptional customer service.</p>
              
              <h3 style="color: #667eea;">What makes us different:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0;">🌿 Premium THCA flower with full COAs</li>
                <li style="padding: 5px 0;">🔬 Third-party lab tested for purity and potency</li>
                <li style="padding: 5px 0;">📦 Discreet, fast shipping nationwide</li>
                <li style="padding: 5px 0;">💎 Loyalty rewards program</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.VITE_APP_URL || 'https://risevia.com'}/shop" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Explore Our Products
                </a>
              </div>
              
              <p>Questions? We're here to help at <a href="mailto:${REPLY_TO_EMAIL}">${REPLY_TO_EMAIL}</a></p>
              
              <p>Welcome aboard!</p>
              <p><strong>The Rise Via Team</strong></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Rise Via. All rights reserved.</p>
              <p>
                <a href="${process.env.VITE_APP_URL || 'https://risevia.com'}/privacy" style="color: #888;">Privacy Policy</a> | 
                <a href="${process.env.VITE_APP_URL || 'https://risevia.com'}/terms" style="color: #888;">Terms of Service</a>
              </p>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to Rise Via!\n\nHi ${name},\n\nWelcome to the Rise Via family! We're thrilled to have you join our community of cannabis enthusiasts.\n\nVisit our shop: ${process.env.VITE_APP_URL || 'https://risevia.com'}/shop\n\nThe Rise Via Team`
      });
      
      if (error) throw error;

      // Log email
      await this.logEmail(to, 'Welcome to Rise Via!', 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      await this.logEmail(to, 'Welcome to Rise Via!', 'failed');
      return { success: false, error };
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
      const itemsHtml = orderData.items 
        ? orderData.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')
        : '';

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject: `Order Confirmation #${orderData.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
              <p style="color: white; margin: 10px 0;">Order #${orderData.orderNumber}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Thank you for your order!</p>
              
              ${itemsHtml ? `
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background: #f0f0f0;">
                      <th style="padding: 10px; text-align: left;">Item</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                      <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">$${orderData.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              ` : `
                <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
              `}
              
              ${orderData.estimatedDelivery ? `
                <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.VITE_APP_URL || 'https://risevia.com'}/track-order?order=${orderData.orderNumber}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Track Your Order
                </a>
              </div>
              
              <p>If you have any questions, please contact us at <a href="mailto:${REPLY_TO_EMAIL}">${REPLY_TO_EMAIL}</a></p>
              
              <p>Thank you for choosing Rise Via!</p>
            </div>
          </body>
          </html>
        `,
        text: `Order Confirmation\n\nOrder Number: ${orderData.orderNumber}\nTotal: $${orderData.total.toFixed(2)}\n\nTrack your order: ${process.env.VITE_APP_URL || 'https://risevia.com'}/track-order?order=${orderData.orderNumber}\n\nThank you for choosing Rise Via!`
      });
      
      if (error) throw error;

      await this.logEmail(to, `Order Confirmation #${orderData.orderNumber}`, 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      await this.logEmail(to, `Order Confirmation #${orderData.orderNumber}`, 'failed');
      return { success: false, error };
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
      const statusMessages: Record<string, string> = {
        pending: 'Your order has been received and is being processed.',
        confirmed: 'Your order has been confirmed and will be processed soon.',
        processing: 'Your order is currently being prepared for shipment.',
        shipped: 'Your order has been shipped and is on its way!',
        delivered: 'Your order has been successfully delivered.',
        cancelled: 'Your order has been cancelled.',
        refunded: 'Your order has been refunded.'
      };

      const statusColors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#10b981',
        processing: '#3b82f6',
        shipped: '#8b5cf6',
        delivered: '#10b981',
        cancelled: '#ef4444',
        refunded: '#6b7280'
      };

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject: `Order Update #${orderData.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${statusColors[newStatus] || '#667eea'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Order Status Update</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColors[newStatus] || '#667eea'}; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
              <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
              <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.VITE_APP_URL || 'https://risevia.com'}/track-order?order=${orderData.orderNumber}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  View Order Details
                </a>
              </div>
              
              <p>Thank you for choosing Rise Via!</p>
            </div>
          </body>
          </html>
        `,
        text: `Order Status Update\n\nOrder Number: ${orderData.orderNumber}\nStatus: ${newStatus}\n${statusMessages[newStatus] || 'Your order status has been updated.'}\n\nView order: ${process.env.VITE_APP_URL || 'https://risevia.com'}/track-order?order=${orderData.orderNumber}`
      });
      
      if (error) throw error;

      await this.logEmail(to, `Order Update #${orderData.orderNumber}`, 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order status update:', error);
      await this.logEmail(to, `Order Update #${orderData.orderNumber}`, 'failed');
      return { success: false, error };
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
      const trackingUrls: Record<string, string> = {
        'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${shippingData.trackingNumber}`,
        'UPS': `https://www.ups.com/track?tracknum=${shippingData.trackingNumber}`,
        'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${shippingData.trackingNumber}`,
        'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${shippingData.trackingNumber}`
      };

      const trackingUrl = trackingUrls[shippingData.carrier] || '#';

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject: `Your Order #${shippingData.orderNumber} Has Shipped!`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">📦 Your Order Has Shipped!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Great news! Your order #${shippingData.orderNumber} is on its way.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Tracking Information:</h3>
                <p><strong>Carrier:</strong> ${shippingData.carrier}</p>
                <p><strong>Tracking Number:</strong> ${shippingData.trackingNumber}</p>
                <p><strong>Estimated Delivery:</strong> ${shippingData.estimatedDelivery}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${trackingUrl}" 
                   style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Track Your Package
                </a>
              </div>
              
              <p>Thank you for your patience!</p>
              <p><strong>The Rise Via Team</strong></p>
            </div>
          </body>
          </html>
        `,
        text: `Your Order Has Shipped!\n\nOrder Number: ${shippingData.orderNumber}\nCarrier: ${shippingData.carrier}\nTracking Number: ${shippingData.trackingNumber}\nEstimated Delivery: ${shippingData.estimatedDelivery}\n\nTrack your package: ${trackingUrl}`
      });
      
      if (error) throw error;

      await this.logEmail(to, `Shipping Notification #${shippingData.orderNumber}`, 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
      await this.logEmail(to, `Shipping Notification #${shippingData.orderNumber}`, 'failed');
      return { success: false, error };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const resetUrl = `${process.env.VITE_APP_URL || 'https://risevia.com'}/reset-password?token=${resetToken}`;
      
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        replyTo: REPLY_TO_EMAIL,
        subject: 'Password Reset Request - Rise Via',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Password Reset Request</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p>Best regards,<br><strong>The Rise Via Team</strong></p>
            </div>
          </body>
          </html>
        `,
        text: `Password Reset Request\n\nWe received a request to reset your password.\n\nReset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThe Rise Via Team`
      });
      
      if (error) throw error;

      await this.logEmail(email, 'Password Reset Request', 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      await this.logEmail(email, 'Password Reset Request', 'failed');
      return { success: false, error };
    }
  },

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, name: string, token: string): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const verifyUrl = `${process.env.VITE_APP_URL || 'https://risevia.com'}/verify-email?token=${token}`;
      
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject: 'Verify Your Email Address - Rise Via',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Verify Your Email</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${name},</p>
              
              <p>Please click the link below to verify your email address:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" 
                   style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
              
              <p>If you didn't create an account, you can safely ignore this email.</p>
              
              <p>The Rise Via Team</p>
            </div>
          </body>
          </html>
        `,
        text: `Verify Your Email\n\nHi ${name},\n\nPlease verify your email address: ${verifyUrl}\n\nIf you didn't create an account, you can safely ignore this email.\n\nThe Rise Via Team`
      });
      
      if (error) throw error;

      await this.logEmail(to, 'Email Verification', 'sent');
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      await this.logEmail(to, 'Email Verification', 'failed');
      return { success: false, error };
    }
  },

  /**
   * Log email attempt to database
   */
  async logEmail(to: string, subject: string, status: 'sent' | 'failed'): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
        return;
      }

      await sql`
        INSERT INTO email_logs (to_email, subject, body, status, sent_at, created_at)
        VALUES (${to}, ${subject}, ${status === 'sent' ? 'Email sent successfully' : 'Email failed to send'}, ${status}, ${status === 'sent' ? 'NOW()' : null}, NOW())
      `;
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  },

  /**
   * Send generic email
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        replyTo: REPLY_TO_EMAIL,
        subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Simple HTML stripping
      });

      if (error) throw error;

      await this.logEmail(to, subject, 'sent');
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      await this.logEmail(to, subject, 'failed');
      return false;
    }
  },

  /**
   * Get email logs from database
   */
  async getEmailLogs(limit: number = 50): Promise<EmailLog[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty email logs');
        return [];
      }

      const logs = await sql`
        SELECT * FROM email_logs 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
      
      return (logs || []) as Array<EmailLog>;
    } catch (error) {
      console.error('Failed to get email logs:', error);
      return [];
    }
  },

  /**
   * Get email template from database
   */
  async getEmailTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null email template');
        return null;
      }

      const templates = await sql`
        SELECT * FROM email_templates 
        WHERE name = ${name}
      `;
      
      return templates.length > 0 ? templates[0] as EmailTemplate : null;
    } catch (error) {
      console.error('Failed to get email template:', error);
      return null;
    }
  }
};

export { emailService };
export default emailService;
