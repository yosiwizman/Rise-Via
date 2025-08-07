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
  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  async getAllProducts() {
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('track_inventory', true)
      .eq('in_stock', true);
    
    if (error) throw error;
    
    const lowStockProducts = data?.filter(product => 
      product.quantity <= (threshold || product.low_stock_alert)
    ) || [];
    
    return lowStockProducts.sort((a, b) => a.quantity - b.quantity);
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
  },

  async getProductCount() {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  },

  async updateProductImages() {
    const productImageUpdates = [
      { name: 'Purple Haze', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
      { name: 'Granddaddy Purple', image: 'https://images.unsplash.com/photo-1583912267550-3a0b5fb4e3d3?w=400' },
      { name: 'White Widow', image: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400' },
      { name: 'Green Crack', image: 'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=400' },
      { name: 'Northern Lights', image: 'https://images.unsplash.com/photo-1605007493699-05d82c7f9f85?w=400' },
      { name: 'Jack Herer', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' },
      { name: 'Girl Scout Cookies', image: 'https://images.unsplash.com/photo-1576424275780-5b5b5b5b5b5b?w=400' },
      { name: 'AK-47', image: 'https://images.unsplash.com/photo-1583912267550-3a0b5fb4e3d3?w=400' },
      { name: 'Pineapple Express', image: 'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=400' },
      { name: 'Gorilla Glue #4', image: 'https://images.unsplash.com/photo-1605007493699-05d82c7f9f85?w=400' },
      { name: 'Wedding Cake', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' }
    ];

    const results = [];
    for (const update of productImageUpdates) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ 
            thumbnail: update.image,
            images: [update.image],
            updated_at: new Date().toISOString()
          })
          .eq('name', update.name)
          .select();

        if (error) {
          console.error(`Error updating ${update.name}:`, error);
          results.push({ name: update.name, success: false, error });
        } else {
          console.log(`Updated ${update.name} image`);
          results.push({ name: update.name, success: true, data });
        }
      } catch (error) {
        console.error(`Failed to update ${update.name}:`, error);
        results.push({ name: update.name, success: false, error });
      }
    }

    return results;
  }
};
