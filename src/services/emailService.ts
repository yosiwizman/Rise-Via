import { Resend } from 'resend';
import { sql } from '../lib/database';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY || 'placeholder-key');

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
}

export interface EmailLog {
  id: string
  to_email: string
  subject: string
  body: string
  status: 'sent' | 'failed' | 'pending'
  sent_at?: string
  created_at: string
}

const emailService = {
  sendWelcomeEmail: async (to: string, name: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <welcome@risevia.com>',
        to,
        subject: 'Welcome to Rise Via!',
        html: `
          <h1>Welcome to Rise Via!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account with Rise Via.</p>
          <p>You can now browse our premium THCA cannabis products and enjoy member benefits.</p>
          <p>Happy shopping!</p>
          <p>The Rise Via Team</p>
        `
      });
      
      if (error) throw error;

      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status, sent_at)
          VALUES (${to}, 'Welcome to Rise Via!', 'Welcome email sent', 'sent', NOW())
        `
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status)
          VALUES (${to}, 'Welcome to Rise Via!', 'Welcome email failed', 'failed')
        `
      }
      
      return { success: false, error };
    }
  },

  sendOrderConfirmation: async (to: string, orderData: { orderNumber: string; total: number }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <orders@risevia.com>',
        to,
        subject: `Order Confirmation #${orderData.orderNumber}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
          <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p><strong>Total:</strong> $${orderData.total}</p>
          <p>We'll send you updates as your order is processed.</p>
        `
      });
      
      if (error) throw error;

      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status, sent_at)
          VALUES (${to}, ${`Order Confirmation #${orderData.orderNumber}`}, 'Order confirmation sent', 'sent', NOW())
        `
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status)
          VALUES (${to}, ${`Order Confirmation #${orderData.orderNumber}`}, 'Order confirmation failed', 'failed')
        `
      }
      
      return { success: false, error };
    }
  },

  sendOrderStatusUpdate: async (to: string, orderData: { orderNumber: string; total: number }, newStatus: string) => {
    try {
      const statusMessages = {
        pending: 'Your order has been received and is being processed.',
        processing: 'Your order is currently being prepared for shipment.',
        shipped: 'Your order has been shipped and is on its way!',
        delivered: 'Your order has been successfully delivered.',
        cancelled: 'Your order has been cancelled.'
      };

      const { data, error } = await resend.emails.send({
        from: 'Rise Via <orders@risevia.com>',
        to,
        subject: `Order Update #${orderData.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        html: `
          <h1>Order Status Update</h1>
          <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
          <p>${statusMessages[newStatus as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
          <p><strong>Total:</strong> $${orderData.total}</p>
          <p>Thank you for choosing Rise Via!</p>
        `
      });
      
      if (error) throw error;

      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status, sent_at)
          VALUES (${to}, ${`Order Update #${orderData.orderNumber}`}, ${`Order status updated to ${newStatus}`}, 'sent', NOW())
        `
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order status update:', error);
      
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status)
          VALUES (${to}, ${`Order Update #${orderData.orderNumber}`}, ${`Order status update failed for ${newStatus}`}, 'failed')
        `
      }
      
      return { success: false, error };
    }
  },

  sendVerificationEmail: async (to: string, name: string, token: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Rise Via <verify@risevia.com>',
        to,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Verify Your Email</h1>
          <p>Hi ${name},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="https://rise-via.vercel.app/verify-email?token=${token}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
             Verify Email Address
          </a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>The Rise Via Team</p>
        `
      });
      
      if (error) throw error;

      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status, sent_at)
          VALUES (${to}, 'Verify Your Email Address', 'Email verification sent', 'sent', NOW())
        `
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
      } else {
        await sql`
          INSERT INTO email_logs (to_email, subject, body, status)
          VALUES (${to}, 'Verify Your Email Address', 'Email verification failed', 'failed')
        `
      }
      
      return { success: false, error };
    }
  },

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping email log');
        return true;
      }

      await sql`
        INSERT INTO email_logs (to_email, subject, body, status, sent_at)
        VALUES (${to}, ${subject}, ${body}, 'sent', NOW())
      `
      return true
    } catch {
      return false
    }
  },

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
      `
      return (logs || []) as EmailLog[]
    } catch {
      return []
    }
  },

  async getEmailTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null email template');
        return null;
      }

      const templates = await sql`
        SELECT * FROM email_templates 
        WHERE name = ${name}
      `
      return templates.length > 0 ? templates[0] as EmailTemplate : null
    } catch {
      return null
    }
  }
};

export { emailService };
export default emailService;
