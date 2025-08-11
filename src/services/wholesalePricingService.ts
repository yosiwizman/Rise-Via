import { sql } from '../lib/neon';

export interface WholesaleTier {
  name: string;
  discountPercentage: number;
  minimumOrder: number;
  creditTerms: string;
  benefits: string[];
}

export interface PurchaseOrder {
  id: string;
  customerId: string;
  orderNumber: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  creditTerms: string;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'PAID';
  createdAt: Date;
  dueDate: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  wholesalePrice: number;
  total: number;
}

export const WHOLESALE_TIERS: Record<string, WholesaleTier> = {
  WHOLESALE: {
    name: 'Wholesale',
    discountPercentage: 30,
    minimumOrder: 500,
    creditTerms: 'Net 30',
    benefits: [
      '30% off retail prices',
      'Net 30 payment terms',
      'Dedicated account manager',
      'Priority customer support'
    ]
  },
  DISTRIBUTOR: {
    name: 'Distributor',
    discountPercentage: 40,
    minimumOrder: 1000,
    creditTerms: 'Net 30',
    benefits: [
      '40% off retail prices',
      'Net 30 payment terms',
      'Volume discounts available',
      'Marketing support materials',
      'Custom product requests'
    ]
  },
  PARTNER: {
    name: 'Partner',
    discountPercentage: 50,
    minimumOrder: 2500,
    creditTerms: 'Net 60',
    benefits: [
      '50% off retail prices',
      'Net 60 payment terms',
      'Exclusive product access',
      'Co-marketing opportunities',
      'Priority inventory allocation'
    ]
  }
};

class WholesalePricingService {
  getTierInfo(tierName: string): WholesaleTier | null {
    return WHOLESALE_TIERS[tierName] || null;
  }

  calculateWholesalePrice(retailPrice: number, tierName: string): number {
    const tier = this.getTierInfo(tierName);
    if (!tier) return retailPrice;
    
    const discount = retailPrice * (tier.discountPercentage / 100);
    return Math.round((retailPrice - discount) * 100) / 100;
  }

  calculateOrderDiscount(subtotal: number, tierName: string): number {
    const tier = this.getTierInfo(tierName);
    if (!tier) return 0;
    
    return Math.round(subtotal * (tier.discountPercentage / 100) * 100) / 100;
  }

  async createPurchaseOrder(customerId: string, items: PurchaseOrderItem[], tierName: string): Promise<PurchaseOrder | null> {
    try {
      const tier = this.getTierInfo(tierName);
      if (!tier) throw new Error('Invalid wholesale tier');

      const orderNumber = `PO-${Date.now()}`;
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const discount = this.calculateOrderDiscount(subtotal, tierName);
      const total = subtotal - discount;

      if (total < tier.minimumOrder) {
        throw new Error(`Minimum order of $${tier.minimumOrder} required for ${tier.name} tier`);
      }

      const dueDate = new Date();
      if (tier.creditTerms === 'Net 30') {
        dueDate.setDate(dueDate.getDate() + 30);
      } else if (tier.creditTerms === 'Net 60') {
        dueDate.setDate(dueDate.getDate() + 60);
      }

      const purchaseOrder: PurchaseOrder = {
        id: `po_${Date.now()}`,
        customerId,
        orderNumber,
        items,
        subtotal,
        discount,
        total,
        creditTerms: tier.creditTerms,
        status: 'PENDING',
        createdAt: new Date(),
        dueDate
      };

      if (!sql) {
        console.warn('⚠️ Database not available, returning null for purchase order creation');
        return null;
      }

      await sql`
        INSERT INTO purchase_orders (
          id, customer_id, order_number, items, subtotal, discount, total, 
          credit_terms, status, created_at, due_date
        ) VALUES (
          ${purchaseOrder.id}, ${customerId}, ${orderNumber}, ${JSON.stringify(items)}, 
          ${subtotal}, ${discount}, ${total}, ${tier.creditTerms}, 'PENDING', 
          ${new Date().toISOString()}, ${dueDate.toISOString()}
        )
      `;

      return purchaseOrder;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      return null;
    }
  }

  async getPurchaseOrders(customerId: string): Promise<PurchaseOrder[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for purchase orders');
        return [];
      }

      const orders = await sql`
        SELECT * FROM purchase_orders 
        WHERE customer_id = ${customerId} 
        ORDER BY created_at DESC
      `;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return orders.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        orderNumber: order.order_number,
        items: JSON.parse(order.items),
        subtotal: parseFloat(order.subtotal),
        discount: parseFloat(order.discount),
        total: parseFloat(order.total),
        creditTerms: order.credit_terms,
        status: order.status as PurchaseOrder['status'],
        createdAt: new Date(order.created_at),
        dueDate: new Date(order.due_date)
      }));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return [];
    }
  }

  async updatePurchaseOrderStatus(orderId: string, status: PurchaseOrder['status']): Promise<boolean> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning false for purchase order status update');
        return false;
      }

      await sql`
        UPDATE purchase_orders 
        SET status = ${status}, updated_at = ${new Date().toISOString()}
        WHERE id = ${orderId}
      `;
      return true;
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      return false;
    }
  }

  generateInvoice(purchaseOrder: PurchaseOrder): string {
    const invoice = `
INVOICE
Order Number: ${purchaseOrder.orderNumber}
Date: ${purchaseOrder.createdAt.toLocaleDateString()}
Due Date: ${purchaseOrder.dueDate.toLocaleDateString()}
Credit Terms: ${purchaseOrder.creditTerms}

ITEMS:
${purchaseOrder.items.map(item => 
  `${item.productName} - Qty: ${item.quantity} - Unit: $${item.wholesalePrice} - Total: $${item.total}`
).join('\n')}

Subtotal: $${purchaseOrder.subtotal}
Discount: -$${purchaseOrder.discount}
TOTAL: $${purchaseOrder.total}

Payment Terms: ${purchaseOrder.creditTerms}
Status: ${purchaseOrder.status}
    `.trim();

    return invoice;
  }

  async createPurchaseOrdersTable(): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping purchase orders table creation');
        return;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS purchase_orders (
          id VARCHAR(255) PRIMARY KEY,
          customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          order_number VARCHAR(255) UNIQUE NOT NULL,
          items JSONB NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          discount DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          credit_terms VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'PENDING',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          due_date TIMESTAMP NOT NULL
        )
      `;
    } catch (error) {
      console.error('Error creating purchase_orders table:', error);
    }
  }
}

export const wholesalePricingService = new WholesalePricingService();
