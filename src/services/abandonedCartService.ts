import { sql } from '../lib/neon';

export interface AbandonedCart {
  id: string;
  sessionId: string;
  customerEmail?: string;
  cartData: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>;
    total: number;
    currency: string;
  };
  totalAmount: number;
  createdAt: string;
  lastUpdated: string;
  recoveryEmailSent: boolean;
  recovered: boolean;
}

export interface RecoveryEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export const abandonedCartService = {
  async trackAbandonedCart(
    sessionId: string,
    cartItems: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>,
    customerEmail?: string
  ): Promise<void> {
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const cartData = {
        items: cartItems,
        total: totalAmount,
        currency: 'USD'
      };

      await this.saveAbandonedCart(sessionId, cartData, totalAmount, customerEmail);
    } catch (error) {
      console.error('Error tracking abandoned cart:', error);
    }
  },

  async saveAbandonedCart(
    sessionId: string,
    cartData: AbandonedCart['cartData'],
    totalAmount: number,
    customerEmail?: string
  ): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping abandoned cart save');
        return;
      }

      await sql`
        INSERT INTO abandoned_carts (session_id, customer_email, cart_data, total_amount, created_at, last_updated)
        VALUES (${sessionId}, ${customerEmail || null}, ${JSON.stringify(cartData)}, ${totalAmount}, NOW(), NOW())
        ON CONFLICT (session_id) 
        DO UPDATE SET 
          cart_data = ${JSON.stringify(cartData)},
          total_amount = ${totalAmount},
          last_updated = NOW(),
          customer_email = COALESCE(${customerEmail || null}, abandoned_carts.customer_email)
      `;
    } catch (error) {
      console.error('Error saving abandoned cart:', error);
      throw error;
    }
  },

  trackCartActivity(customerEmail?: string): void {
    try {
      const cartData = this.getCurrentCartData();
      if (cartData.items.length > 0) {
        this.updateAbandonmentTimer(cartData, customerEmail);
      }
    } catch (error) {
      console.error('Error tracking cart activity:', error);
    }
  },

  getCurrentCartData(): { items: Array<{ id: string; name: string; price: number; quantity: number; image: string }> } {
    try {
      const cartData = localStorage.getItem('risevia-cart');
      if (!cartData) return { items: [] };
      
      const parsed = JSON.parse(cartData);
      return {
        items: parsed.state?.items || []
      };
    } catch {
      return { items: [] };
    }
  },

  updateAbandonmentTimer(cartData: { items: Array<{ id: string; name: string; price: number; quantity: number; image: string }> }, customerEmail?: string): void {
    const sessionId = this.getOrCreateSessionId();
    
    setTimeout(() => {
      this.trackAbandonedCart(sessionId, cartData.items, customerEmail);
    }, 30 * 60 * 1000);
  },

  getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('risevia-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('risevia-session-id', sessionId);
    }
    return sessionId;
  },

  async getAbandonedCarts(
    hoursOld: number = 1,
    limit: number = 100
  ): Promise<AbandonedCart[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty abandoned carts array');
        return [];
      }

      const result = await sql`
        SELECT * FROM abandoned_carts 
        WHERE last_updated < NOW() - INTERVAL '${hoursOld} hours'
        AND recovery_email_sent = false
        AND recovered = false
        AND customer_email IS NOT NULL
        ORDER BY total_amount DESC
        LIMIT ${limit}
      `;

      return (result as Array<Record<string, unknown>>).map((row) => ({
        id: row.id as string,
        sessionId: row.session_id as string,
        customerEmail: row.customer_email as string,
        cartData: {
          items: (row.cart_data as { items?: Array<{
            id: string;
            name: string;
            price: number;
            quantity: number;
            image: string;
          }>; total?: number; currency?: string })?.items || [],
          total: (row.cart_data as { items?: unknown[]; total?: number; currency?: string })?.total || 0,
          currency: (row.cart_data as { items?: unknown[]; total?: number; currency?: string })?.currency || 'USD'
        },
        totalAmount: row.total_amount as number,
        createdAt: row.created_at as string,
        lastUpdated: row.last_updated as string,
        recoveryEmailSent: row.recovery_email_sent as boolean,
        recovered: row.recovered as boolean
      }));
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      return [];
    }
  },

  async markRecoveryEmailSent(cartId: string): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping recovery email mark');
        return;
      }

      await sql`
        UPDATE abandoned_carts 
        SET recovery_email_sent = true 
        WHERE id = ${cartId}
      `;
    } catch (error) {
      console.error('Error marking recovery email sent:', error);
      throw error;
    }
  },

  async markCartRecovered(sessionId: string): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping cart recovery mark');
        return;
      }

      await sql`
        UPDATE abandoned_carts 
        SET recovered = true 
        WHERE session_id = ${sessionId}
      `;
    } catch (error) {
      console.error('Error marking cart recovered:', error);
      throw error;
    }
  },

  generateRecoveryEmail(cart: AbandonedCart): RecoveryEmailTemplate {
    const itemsList = cart.cartData.items
      .map(item => `• ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const subject = `Don't forget your RiseViA cart - $${cart.totalAmount.toFixed(2)} waiting for you!`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Your RiseViA Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .cart-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #10b981; }
          .total { font-size: 18px; font-weight: bold; color: #10b981; text-align: right; margin: 20px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Your RiseViA Cart is Waiting</h1>
            <p>Complete your order and enjoy premium hemp products</p>
          </div>
          
          <div class="content">
            <h2>Hi there!</h2>
            <p>You left some amazing items in your cart. Don't miss out on these premium hemp products:</p>
            
            ${cart.cartData.items.map(item => `
              <div class="cart-item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} | Price: $${(item.price * item.quantity).toFixed(2)}
              </div>
            `).join('')}
            
            <div class="total">
              Total: $${cart.totalAmount.toFixed(2)}
            </div>
            
            <p>Complete your order now and enjoy:</p>
            <ul>
              <li>✅ Premium quality hemp products</li>
              <li>✅ Fast, discreet shipping</li>
              <li>✅ 30-day satisfaction guarantee</li>
              <li>✅ Expert customer support</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://risevia.com/cart?recover=${cart.sessionId}" class="cta-button">
                Complete Your Order
              </a>
            </div>
            
            <p><strong>Limited time:</strong> Use code <strong>COMEBACK10</strong> for 10% off your order!</p>
          </div>
          
          <div class="footer">
            <p>RiseViA - Premium Hemp Products</p>
            <p>If you no longer wish to receive these emails, <a href="#">unsubscribe here</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      🌿 Your RiseViA Cart is Waiting

      Hi there!

      You left some amazing items in your cart. Don't miss out on these premium hemp products:

      ${itemsList}

      Total: $${cart.totalAmount.toFixed(2)}

      Complete your order now and enjoy:
      ✅ Premium quality hemp products
      ✅ Fast, discreet shipping  
      ✅ 30-day satisfaction guarantee
      ✅ Expert customer support

      Complete your order: https://risevia.com/cart?recover=${cart.sessionId}

      Limited time: Use code COMEBACK10 for 10% off your order!

      ---
      RiseViA - Premium Hemp Products
      If you no longer wish to receive these emails, visit: https://risevia.com/unsubscribe
    `;

    return {
      subject,
      htmlContent,
      textContent
    };
  },

  async sendRecoveryEmail(cart: AbandonedCart): Promise<boolean> {
    try {
      if (!cart.customerEmail) {
        console.warn('Cannot send recovery email: no customer email');
        return false;
      }

      const emailTemplate = this.generateRecoveryEmail(cart);
      
      console.log(`Sending recovery email to ${cart.customerEmail}`);
      console.log(`Subject: ${emailTemplate.subject}`);
      
      await this.markRecoveryEmailSent(cart.id);
      
      return true;
    } catch (error) {
      console.error('Error sending recovery email:', error);
      return false;
    }
  },

  async processRecoveryEmails(): Promise<void> {
    try {
      const abandonedCarts = await this.getAbandonedCarts(1, 50);
      
      console.log(`Found ${abandonedCarts.length} abandoned carts for recovery`);
      
      for (const cart of abandonedCarts) {
        await this.sendRecoveryEmail(cart);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error processing recovery emails:', error);
    }
  },

  async getRecoveryStats(days: number = 30): Promise<{
    totalAbandoned: number;
    emailsSent: number;
    recovered: number;
    recoveryRate: number;
    totalValue: number;
    recoveredValue: number;
  }> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty recovery stats');
        return {
          totalAbandoned: 0,
          emailsSent: 0,
          recovered: 0,
          recoveryRate: 0,
          totalValue: 0,
          recoveredValue: 0
        };
      }

      const stats = await sql`
        SELECT 
          COUNT(*) as total_abandoned,
          SUM(CASE WHEN recovery_email_sent THEN 1 ELSE 0 END) as emails_sent,
          SUM(CASE WHEN recovered THEN 1 ELSE 0 END) as recovered,
          SUM(total_amount) as total_value,
          SUM(CASE WHEN recovered THEN total_amount ELSE 0 END) as recovered_value
        FROM abandoned_carts 
        WHERE created_at > NOW() - INTERVAL '${days} days'
      `;

      const result = stats[0] as Record<string, unknown>;
      const emailsSent = result.emails_sent as number;
      const recovered = result.recovered as number;
      const recoveryRate = emailsSent > 0 ? (recovered / emailsSent) * 100 : 0;

      return {
        totalAbandoned: result.total_abandoned as number,
        emailsSent,
        recovered,
        recoveryRate,
        totalValue: result.total_value as number,
        recoveredValue: result.recovered_value as number
      };
    } catch (error) {
      console.error('Error getting recovery stats:', error);
      return {
        totalAbandoned: 0,
        emailsSent: 0,
        recovered: 0,
        recoveryRate: 0,
        totalValue: 0,
        recoveredValue: 0
      };
    }
  }
};

export default abandonedCartService;
