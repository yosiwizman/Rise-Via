import { supabase } from '../lib/supabase';

interface Product {
  id?: string;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  short_desc?: string;
  strain: string;
  strain_type?: string;
  grow_type?: string;
  thc?: number;
  thca?: number;
  cbd?: number;
  cbg?: number;
  total_cannabinoids?: number;
  thumbnail?: string;
  images?: string[];
  video_url?: string;
  video_360_url?: string;
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  in_stock: boolean;
  quantity: number;
  low_stock_alert: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  featured: boolean;
  is_new: boolean;
  bestseller: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

interface BulkUpdateData {
  ids: string[];
  updates: Partial<Product>;
}

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        ),
        product_variants (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        ),
        product_variants (*),
        product_terpenes (
          percentage,
          terpenes (
            name,
            description
          )
        ),
        product_effects (
          intensity,
          effects (
            name,
            category
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Product) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async bulkUpdate(bulkData: BulkUpdateData) {
    const promises = bulkData.ids.map(id => 
      this.update(id, bulkData.updates)
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return { successful, failed };
  },

  async bulkDelete(ids: string[]) {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
    return true;
  },

  async getLowStockProducts(threshold?: number) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('track_inventory', true)
      .eq('in_stock', true);

    if (threshold) {
      query = query.lte('quantity', threshold);
    } else {
      query = query.filter('quantity', 'lte', supabase.rpc('get_low_stock_alert'));
    }

    const { data, error } = await query.order('quantity', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getLowStockCount() {
    const { data, error } = await supabase
      .from('products')
      .select('quantity, low_stock_alert')
      .eq('track_inventory', true)
      .eq('in_stock', true);
    
    if (error) throw error;
    
    const lowStockProducts = data?.filter(product => 
      product.quantity <= product.low_stock_alert
    ) || [];
    
    return lowStockProducts.length;
  },

  async search(searchTerm: string, filters: any = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `);

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters.strain && filters.strain !== 'all') {
      query = query.eq('strain', filters.strain);
    }

    if (filters.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  exportToCSV(products: any[]) {
    const headers = [
      'SKU',
      'Name',
      'Strain',
      'THC %',
      'CBD %',
      'Price',
      'Quantity',
      'In Stock',
      'Featured',
      'Created At'
    ];

    const csvData = products.map(product => [
      product.sku,
      product.name,
      product.strain,
      product.thc || 0,
      product.cbd || 0,
      product.base_price,
      product.quantity,
      product.in_stock ? 'Yes' : 'No',
      product.featured ? 'Yes' : 'No',
      new Date(product.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
