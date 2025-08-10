import { sql } from '../lib/neon';

export interface PriceAlert {
  id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  target_price: number;
  current_price: number;
  is_active: boolean;
  created_at: string;
  triggered_at?: string;
  notification_sent: boolean;
}

export const priceAlertsService = {
  async createAlert(alert: Omit<PriceAlert, 'id' | 'created_at' | 'triggered_at' | 'notification_sent'>): Promise<PriceAlert | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for price alert creation');
        return null;
      }

      const alerts = await sql`
        INSERT INTO price_alerts (customer_id, product_id, product_name, target_price, current_price, is_active)
        VALUES (${alert.customer_id}, ${alert.product_id}, ${alert.product_name}, ${alert.target_price}, ${alert.current_price}, ${alert.is_active})
        RETURNING *
      `;
      return alerts.length > 0 ? alerts[0] as PriceAlert : null;
    } catch {
      return null;
    }
  },

  async getCustomerAlerts(customerId: string): Promise<PriceAlert[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for customer alerts');
        return [];
      }

      const alerts = await sql`
        SELECT * FROM price_alerts 
        WHERE customer_id = ${customerId} AND is_active = true
        ORDER BY created_at DESC
      `;
      return (alerts || []) as PriceAlert[];
    } catch {
      return [];
    }
  },

  async updateAlert(alertId: string, updates: Partial<PriceAlert>): Promise<PriceAlert | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for price alert update');
        return null;
      }

      if (updates.target_price !== undefined) {
        const alerts = await sql`
          UPDATE price_alerts 
          SET target_price = ${updates.target_price}
          WHERE id = ${alertId}
          RETURNING *
        `;
        return alerts.length > 0 ? alerts[0] as PriceAlert : null;
      }
      
      if (updates.is_active !== undefined) {
        const alerts = await sql`
          UPDATE price_alerts 
          SET is_active = ${updates.is_active}
          WHERE id = ${alertId}
          RETURNING *
        `;
        return alerts.length > 0 ? alerts[0] as PriceAlert : null;
      }

      return null;
    } catch {
      return null;
    }
  },

  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning false for price alert deletion');
        return false;
      }

      const result = await sql`
        UPDATE price_alerts 
        SET is_active = false
        WHERE id = ${alertId}
      `;
      return result.length > 0;
    } catch {
      return false;
    }
  },

  async checkPriceDrops(productId: string, newPrice: number): Promise<PriceAlert[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for price drops check');
        return [];
      }

      const triggeredAlerts = await sql`
        SELECT * FROM price_alerts 
        WHERE product_id = ${productId} 
        AND target_price >= ${newPrice}
        AND is_active = true
        AND notification_sent = false
      `;

      if (triggeredAlerts.length > 0) {
        await sql`
          UPDATE price_alerts 
          SET triggered_at = NOW(), notification_sent = true, current_price = ${newPrice}
          WHERE product_id = ${productId} 
          AND target_price >= ${newPrice}
          AND is_active = true
          AND notification_sent = false
        `;
      }

      return (triggeredAlerts || []) as PriceAlert[];
    } catch {
      return [];
    }
  },

  async updateProductPrices(productId: string, newPrice: number): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping product price update');
        return;
      }

      await sql`
        UPDATE price_alerts 
        SET current_price = ${newPrice}
        WHERE product_id = ${productId} AND is_active = true
      `;
    } catch {
      return;
    }
  }
};
