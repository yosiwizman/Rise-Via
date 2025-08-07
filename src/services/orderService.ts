import { supabase } from '../lib/supabase';
import { emailService } from './emailService';

export interface Order {
  id?: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  fulfillment_type: string;
  scheduled_for?: string;
  address_id?: string;
  driver_id?: string;
  delivered_at?: string;
  age_verified: boolean;
  id_checked: boolean;
  signature?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface OrderStats {
  todaysSales: number;
  todaysOrders: number;
  totalOrders: number;
  pendingOrders: number;
}

export const orderService = {
  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email
        ),
        order_items (
          *,
          products (
            name,
            sku
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          *,
          products (
            name,
            sku,
            thumbnail
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customers (
          email
        )
      `)
      .single();
    
    if (error) throw error;
    
    if (data && data.customers?.email) {
      try {
        await emailService.sendOrderStatusUpdate(data, status, data.customers.email);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }
    
    return data;
  },

  async createOrder(orderData: {
    customer_id: string;
    customer_email: string;
    customer_name?: string;
    subtotal: number;
    tax: number;
    delivery_fee?: number;
    discount?: number;
    total: number;
    fulfillment_type: string;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
  }) {
    const orderNumber = `RV${Date.now()}`;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_id: orderData.customer_id,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        delivery_fee: orderData.delivery_fee || 0,
        discount: orderData.discount || 0,
        total: orderData.total,
        status: 'pending',
        payment_status: 'pending',
        fulfillment_type: orderData.fulfillment_type,
        age_verified: true,
        id_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }
    }

    try {
      await emailService.sendOrderConfirmation({
        ...order,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        items: orderData.items
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    return order;
  },

  async getTodaysOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());
    
    if (error) throw error;
    return data;
  },

  async getOrderStats(): Promise<OrderStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todaysOrders, error: todaysError } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (todaysError) throw todaysError;

    const { count: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    const todaysSales = todaysOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
    const todaysOrderCount = todaysOrders?.length || 0;

    return {
      todaysSales,
      todaysOrders: todaysOrderCount,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0
    };
  },

  async getRecentOrders(limit: number = 10) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getOrderCount() {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};
