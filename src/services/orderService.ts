import { supabase } from '../lib/supabase';

export interface Order {
  id?: string;
  order_number?: string;
  payment_method_id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  phone: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<string> {
    const orderNumber = `RV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...orderData,
        order_number: orderNumber,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return data.id;
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  },

  async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  },

  async getAllOrders(limit = 50, offset = 0): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  }
};
