import { supabase } from '../lib/supabase';

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
  async getAll() {
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
      .order('created_at', { ascending: false });
    
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
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
  }
};
