import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 'placeholder-key');

export const emailService = {
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
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }
  },

  sendOrderConfirmation: async (to: string, orderData: any) => {
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
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return { success: false, error };
    }
  }
};
