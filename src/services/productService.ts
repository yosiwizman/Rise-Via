import { supabase } from '../lib/supabase';

export interface Product {
  id?: string;
  sample_id: string;
  name: string;
  slug: string;
  category: string;
  strain_type: string;
  thca_percentage: number;
  batch_id: string;
  volume_available: number;
  description: string;
  effects: string[];
  flavors: string[];
  prices: {
    gram: number;
    eighth: number;
    quarter: number;
    half: number;
    ounce: number;
  };
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLog {
  id?: string;
  product_id: string;
  change_amount: number;
  reason: string;
  previous_count: number;
  new_count: number;
  user_id?: string;
  created_at?: string;
}

export interface InventoryAlert {
  id?: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring';
  threshold: number;
  current_value: number;
  resolved: boolean;
  created_at?: string;
}

export const productService = {
  async createTables() {
    const { error: productsError } = await supabase.rpc('create_products_table');
    const { error: logsError } = await supabase.rpc('create_inventory_logs_table');
    const { error: alertsError } = await supabase.rpc('create_inventory_alerts_table');
    
    if (productsError) console.error('Error creating products table:', productsError);
    if (logsError) console.error('Error creating inventory_logs table:', logsError);
    if (alertsError) console.error('Error creating inventory_alerts table:', alertsError);
  },

  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInventory(productId: string, newCount: number, reason: string, userId?: string): Promise<void> {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');

    const previousCount = product.volume_available;
    const changeAmount = newCount - previousCount;

    await supabase
      .from('products')
      .update({ volume_available: newCount })
      .eq('id', productId);

    await this.logInventoryChange({
      product_id: productId,
      change_amount: changeAmount,
      reason,
      previous_count: previousCount,
      new_count: newCount,
      user_id: userId
    });

    if (newCount <= 10) {
      await this.createInventoryAlert({
        product_id: productId,
        alert_type: newCount === 0 ? 'out_of_stock' : 'low_stock',
        threshold: 10,
        current_value: newCount,
        resolved: false
      });
    }
  },

  async logInventoryChange(log: Omit<InventoryLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('inventory_logs')
      .insert([log]);
    
    if (error) throw error;
  },

  async createInventoryAlert(alert: Omit<InventoryAlert, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('inventory_alerts')
      .insert([alert]);
    
    if (error) throw error;
  },

  async getInventoryLogs(productId?: string): Promise<InventoryLog[]> {
    let query = supabase
      .from('inventory_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getInventoryAlerts(resolved: boolean = false): Promise<InventoryAlert[]> {
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select('*')
      .eq('resolved', resolved)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_alerts')
      .update({ resolved: true })
      .eq('id', alertId);
    
    if (error) throw error;
  },

  async search(searchTerm: string, filters: {
    strainType?: string;
    thcaRange?: { min: number; max: number };
    effects?: string[];
    priceRange?: { min: number; max: number };
  } = {}): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters.strainType && filters.strainType !== 'all') {
      query = query.eq('strain_type', filters.strainType);
    }

    if (filters.thcaRange) {
      query = query
        .gte('thca_percentage', filters.thcaRange.min)
        .lte('thca_percentage', filters.thcaRange.max);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data || [];
  }
};
