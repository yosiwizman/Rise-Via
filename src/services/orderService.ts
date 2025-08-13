/**
 * Order Management Service
 * Handles order creation, processing, and fulfillment
 */

import { sql } from '../lib/neon';
import { 
  reserveInventory, 
  fulfillOrder as fulfillInventoryOrder,
  releaseReservation,
  initializeInventoryTables 
} from '../lib/inventory';
import { createPaymentTransaction, updatePaymentTransaction } from '../lib/payment';
import { emailService } from './emailService';
import { processOrderPoints } from '../lib/loyalty-system';
import { recordPromotionUsage, markCartAsRecovered } from '../lib/promotions';
import { updateCustomerAnalytics } from '../lib/customer-segmentation';

// Initialize inventory tables
initializeInventoryTables();

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email?: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_intent_id?: string;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  created_at: string;
}

export interface CreateOrderData {
  customer_id: string;
  customer_email?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  payment_method?: string;
  payment_intent_id?: string;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  notes?: string;
  session_id?: string; // For abandoned cart tracking
  applied_promotions?: Array<{
    promotion_id: string;
    coupon_code?: string;
    discount_amount: number;
  }>;
}

export interface OrderStatusUpdate {
  status: Order['status'];
  notes?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

/**
 * Initialize order tables
 */
export async function initializeOrderTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping order table initialization');
      return;
    }

    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_intent_id VARCHAR(255),
        shipping_address JSONB,
        billing_address JSONB,
        tracking_number VARCHAR(255),
        carrier VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Order status history table
    await sql`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id)`;

    console.log('✅ Order tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize order tables:', error);
  }
}

// Initialize tables on module load
initializeOrderTables();

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `RV-${timestamp}-${random}`.toUpperCase();
}

/**
 * Calculate tax based on state
 */
function calculateTax(subtotal: number, state?: string): number {
  // State tax rates for cannabis products (simplified)
  const taxRates: Record<string, number> = {
    'CA': 0.15, // California cannabis tax
    'CO': 0.15, // Colorado cannabis tax
    'WA': 0.37, // Washington cannabis tax
    'OR': 0.17, // Oregon cannabis tax
    'NV': 0.10, // Nevada cannabis tax
    'MA': 0.20, // Massachusetts cannabis tax
    'MI': 0.10, // Michigan cannabis tax
    'IL': 0.25, // Illinois cannabis tax
    'AZ': 0.16, // Arizona cannabis tax
    'MT': 0.20, // Montana cannabis tax
  };

  const rate = state ? (taxRates[state] || 0.10) : 0.10; // Default 10% tax
  return Math.round(subtotal * rate * 100) / 100;
}

/**
 * Calculate shipping cost
 */
function calculateShipping(subtotal: number, items: Array<{ quantity: number }>): number {
  // Free shipping over $100
  if (subtotal >= 100) {
    return 0;
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const baseShipping = 7.99;
  const perItemShipping = 1.50;

  return Math.round((baseShipping + (totalQuantity * perItemShipping)) * 100) / 100;
}

export const orderService = {
  async createOrder(orderData: CreateOrderData): Promise<{ order: Order | null; error?: string }> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return { order: null, error: 'Service temporarily unavailable' };
      }

      // Generate unique order number
      const orderNumber = generateOrderNumber();

      // Validate and reserve inventory for each item
      const reservationResults: Array<{ product_id: string; success: boolean; error?: string }> = [];
      
      for (const item of orderData.items) {
        const reservationResult = await reserveInventory(
          item.product_id,
          item.quantity,
          orderNumber,
          'order',
          60 // Reserve for 60 minutes
        );
        
        reservationResults.push({
          product_id: item.product_id,
          ...reservationResult
        });

        if (!reservationResult.success) {
          // Release any successful reservations
          for (const prevResult of reservationResults) {
            if (prevResult.success) {
              await releaseReservation(prevResult.product_id, orderNumber);
            }
          }
          
          return { 
            order: null, 
            error: `Insufficient stock for product ${item.product_name}: ${reservationResult.error}` 
          };
        }
      }

      // Calculate final amounts
      const subtotal = orderData.subtotal;
      const tax = orderData.tax || calculateTax(subtotal, (orderData.shipping_address as any)?.state);
      const shipping = orderData.shipping || calculateShipping(subtotal, orderData.items);
      const discount = orderData.discount || 0;
      const total = subtotal + tax + shipping - discount;

      // Create order record
      const orders = await sql`
        INSERT INTO orders (
          order_number, customer_id, customer_email, subtotal, tax, discount, shipping, total,
          status, payment_status, payment_method, payment_intent_id, shipping_address, billing_address, notes
        )
        VALUES (
          ${orderNumber}, ${orderData.customer_id}, ${orderData.customer_email || null}, ${subtotal}, 
          ${tax}, ${discount}, ${shipping}, ${total},
          'pending', 'pending', ${orderData.payment_method || null}, ${orderData.payment_intent_id || null},
          ${JSON.stringify(orderData.shipping_address || {})}, 
          ${JSON.stringify(orderData.billing_address || {})}, ${orderData.notes || null}
        )
        RETURNING *
      ` as Array<Order>;

      if (orders.length === 0) {
        // Release reservations if order creation failed
        for (const item of orderData.items) {
          await releaseReservation(item.product_id, orderNumber);
        }
        return { order: null, error: 'Failed to create order' };
      }

      const order = orders[0];

      // Create order items
      for (const item of orderData.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, price, discount)
          VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.quantity}, ${item.price}, ${item.discount || 0})
        `;
      }

      // Add status history entry
      await sql`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (${order.id}, 'pending', 'Order created', 'system')
      `;

      // Create payment transaction record
      if (orderData.payment_method) {
        await createPaymentTransaction(
          order.id,
          orderData.customer_id,
          total,
          orderData.payment_method,
          'stripe', // Default to Stripe
          { order_number: orderNumber }
        );
      }

      // Record promotion usage if applicable
      if (orderData.applied_promotions) {
        for (const promotion of orderData.applied_promotions) {
          await recordPromotionUsage(
            promotion.promotion_id,
            orderData.customer_id,
            order.id,
            promotion.discount_amount
          );
        }
      }

      // Mark abandoned cart as recovered if applicable
      if (orderData.session_id) {
        await markCartAsRecovered(orderData.session_id, order.id);
      }

      // Process loyalty points for the order
      await processOrderPoints(orderData.customer_id, order.id, order.total);

      // Update customer analytics
      await updateCustomerAnalytics(orderData.customer_id);

      // Send order confirmation email
      if (orderData.customer_email) {
        try {
          await emailService.sendOrderConfirmation(orderData.customer_email, {
            orderNumber: order.order_number,
            total: order.total,
            items: orderData.items.map(item => ({
              name: item.product_name,
              quantity: item.quantity,
              price: item.price
            })),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
          });
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
          // Don't fail order creation if email fails
        }
      }

      return { order };
    } catch (error) {
      console.error('Order creation error:', error);
      return { order: null, error: 'Failed to create order' };
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return null;
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE id = ${orderId}
      ` as Array<Order>;
      
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return null;
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE order_number = ${orderNumber}
      ` as Array<Order>;
      
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error('Failed to get order by number:', error);
      return null;
    }
  },

  async getOrdersByCustomer(customerId: string, limit: number = 50): Promise<Order[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return [];
      }

      const orders = await sql`
        SELECT * FROM orders 
        WHERE customer_id = ${customerId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      ` as Array<Order>;
      
      return orders || [];
    } catch (error) {
      console.error('Failed to get orders by customer:', error);
      return [];
    }
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return [];
      }

      const items = await sql`
        SELECT * FROM order_items 
        WHERE order_id = ${orderId}
        ORDER BY created_at ASC
      ` as Array<OrderItem>;
      
      return items || [];
    } catch (error) {
      console.error('Failed to get order items:', error);
      return [];
    }
  },

  async updateOrderStatus(
    orderId: string, 
    statusUpdate: OrderStatusUpdate,
    customerEmail?: string
  ): Promise<{ order: Order | null; error?: string }> {
    try {
      if (!sql) {
        return { order: null, error: 'Service temporarily unavailable' };
      }

      // Get current order
      const currentOrder = await this.getOrder(orderId);
      if (!currentOrder) {
        return { order: null, error: 'Order not found' };
      }

      // Update order status
      const updateFields: string[] = [`status = ${statusUpdate.status}`];
      if (statusUpdate.tracking_number) {
        updateFields.push(`tracking_number = ${statusUpdate.tracking_number}`);
      }
      if (statusUpdate.carrier) {
        updateFields.push(`carrier = ${statusUpdate.carrier}`);
      }
      if (statusUpdate.notes) {
        updateFields.push(`notes = ${statusUpdate.notes}`);
      }

      const orders = await sql`
        UPDATE orders 
        SET status = ${statusUpdate.status},
            tracking_number = COALESCE(${statusUpdate.tracking_number || null}, tracking_number),
            carrier = COALESCE(${statusUpdate.carrier || null}, carrier),
            notes = COALESCE(${statusUpdate.notes || null}, notes),
            updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      ` as Array<Order>;

      if (orders.length === 0) {
        return { order: null, error: 'Failed to update order status' };
      }

      const updatedOrder = orders[0];

      // Add status history entry
      await sql`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES (${orderId}, ${statusUpdate.status}, ${statusUpdate.notes || `Status changed to ${statusUpdate.status}`}, 'system')
      `;

      // Handle status-specific actions
      if (statusUpdate.status === 'processing' && currentOrder.status === 'confirmed') {
        // Convert reservations to actual sales
        const orderItems = await this.getOrderItems(orderId);
        
        for (const item of orderItems) {
          const fulfillResult = await fulfillInventoryOrder(
            item.product_id,
            item.quantity,
            updatedOrder.order_number
          );
          
          if (!fulfillResult.success) {
            console.error(`Failed to fulfill item ${item.product_id}:`, fulfillResult.error);
          }
        }
      }

      // Handle inventory release for cancelled orders
      if (statusUpdate.status === 'cancelled') {
        const orderItems = await this.getOrderItems(orderId);
        
        for (const item of orderItems) {
          await releaseReservation(item.product_id, updatedOrder.order_number);
        }
      }

      // Send status update email
      const email = customerEmail || updatedOrder.customer_email;
      if (email) {
        try {
          if (statusUpdate.status === 'shipped' && statusUpdate.tracking_number) {
            await emailService.sendShippingNotification(email, {
              orderNumber: updatedOrder.order_number,
              trackingNumber: statusUpdate.tracking_number,
              carrier: statusUpdate.carrier || 'USPS',
              estimatedDelivery: statusUpdate.estimated_delivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
            });
          } else {
            await emailService.sendOrderStatusUpdate(
              email,
              {
                orderNumber: updatedOrder.order_number,
                total: updatedOrder.total
              },
              statusUpdate.status
            );
          }
        } catch (emailError) {
          console.error('Failed to send order status update email:', emailError);
        }
      }

      return { order: updatedOrder };
    } catch (error) {
      console.error('Failed to update order status:', error);
      return { order: null, error: 'Failed to update order status' };
    }
  },

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['payment_status'],
    paymentMethod?: string,
    paymentIntentId?: string
  ): Promise<{ order: Order | null; error?: string }> {
    try {
      if (!sql) {
        return { order: null, error: 'Service temporarily unavailable' };
      }

      const orders = await sql`
        UPDATE orders 
        SET payment_status = ${paymentStatus},
            payment_method = COALESCE(${paymentMethod || null}, payment_method),
            payment_intent_id = COALESCE(${paymentIntentId || null}, payment_intent_id),
            updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      ` as Array<Order>;

      if (orders.length === 0) {
        return { order: null, error: 'Order not found' };
      }

      const updatedOrder = orders[0];

      // Auto-confirm order when payment is successful
      if (paymentStatus === 'paid' && updatedOrder.status === 'pending') {
        return await this.updateOrderStatus(orderId, { status: 'confirmed' });
      }

      return { order: updatedOrder };
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return { order: null, error: 'Failed to update payment status' };
    }
  },

  async getOrderWithItems(orderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return null;

      const items = await this.getOrderItems(orderId);
      return { ...order, items };
    } catch (error) {
      console.error('Failed to get order with items:', error);
      return null;
    }
  },

  async getOrderAnalytics(
    startDate: string,
    endDate: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Array<{ status: string; count: number }>;
    topProducts: Array<{ product_id: string; product_name: string; quantity_sold: number; revenue: number }>;
  }> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersByStatus: [],
          topProducts: []
        };
      }

      // Get overall stats
      const overallStats = await sql`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as average_order_value
        FROM orders
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        AND status NOT IN ('cancelled')
      ` as Array<{
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
      }>;

      // Get orders by status
      const ordersByStatus = await sql`
        SELECT status, COUNT(*) as count
        FROM orders
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        GROUP BY status
        ORDER BY count DESC
      ` as Array<{ status: string; count: number }>;

      // Get top products
      const topProducts = await sql`
        SELECT 
          oi.product_id,
          oi.product_name,
          SUM(oi.quantity) as quantity_sold,
          SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ${startDate} AND ${endDate}
        AND o.status NOT IN ('cancelled')
        GROUP BY oi.product_id, oi.product_name
        ORDER BY revenue DESC
        LIMIT 10
      ` as Array<{ 
        product_id: string; 
        product_name: string; 
        quantity_sold: number; 
        revenue: number; 
      }>;

      const stats = overallStats[0] || {
        total_orders: 0,
        total_revenue: 0,
        average_order_value: 0
      };

      return {
        totalOrders: stats.total_orders,
        totalRevenue: stats.total_revenue || 0,
        averageOrderValue: stats.average_order_value || 0,
        ordersByStatus: ordersByStatus || [],
        topProducts: topProducts || []
      };
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: [],
        topProducts: []
      };
    }
  },

  async getOrderStatusHistory(orderId: string): Promise<Array<{
    id: string;
    status: string;
    notes: string;
    created_by: string;
    created_at: string;
  }>> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available');
        return [];
      }

      const history = await sql`
        SELECT * FROM order_status_history
        WHERE order_id = ${orderId}
        ORDER BY created_at DESC
      `;

      return history as Array<{
        id: string;
        status: string;
        notes: string;
        created_by: string;
        created_at: string;
      }>;
    } catch (error) {
      console.error('Failed to get order status history:', error);
      return [];
    }
  },

  async cancelOrder(
    orderId: string,
    reason: string,
    customerEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.updateOrderStatus(
        orderId,
        { status: 'cancelled', notes: `Cancelled: ${reason}` },
        customerEmail
      );

      if (!result.order) {
        return { success: false, error: result.error || 'Failed to cancel order' };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return { success: false, error: 'Failed to cancel order' };
    }
  }
};
