import { sql } from '../lib/neon';

interface Product {
  id?: string;
  name: string;
  slug?: string;
  category: string;
  strain_type?: string;
  thca_percentage?: number;
  price: number;
  images: string[];
  hover_image?: string;
  video_url?: string;
  description: string;
  effects?: string[];
  featured?: boolean;
  inventory?: number;
  coa_document?: string;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const productService = {
  async getAll() {
    try {
      const products = await sql`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `;
      return (products || []) as Product[];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  async getById(id: string) {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE id = ${id}
      `;
      return products.length > 0 ? products[0] as Product : null;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const products = await sql`
        INSERT INTO products (
          name, slug, category, strain_type, thca_percentage, price, 
          images, hover_image, video_url, description, effects, 
          featured, inventory, coa_document, in_stock
        )
        VALUES (
          ${product.name}, 
          ${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}, 
          ${product.category}, 
          ${product.strain_type || ''}, 
          ${product.thca_percentage || 0}, 
          ${product.price}, 
          ${JSON.stringify(product.images || [])}, 
          ${product.hover_image || null}, 
          ${product.video_url || null}, 
          ${product.description}, 
          ${JSON.stringify(product.effects || [])}, 
          ${product.featured || false}, 
          ${product.inventory || 0}, 
          ${product.coa_document || null}, 
          ${product.in_stock !== false}
        )
        RETURNING *
      `;
      return products.length > 0 ? products[0] as Product : null;
    } catch (error) {
      console.error('Failed to create product:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Product>) {
    try {
      if (Object.keys(updates).length === 0) return null;

      const products = await sql`
        UPDATE products 
        SET 
          name = COALESCE(${updates.name || null}, name),
          slug = COALESCE(${updates.slug || null}, slug),
          category = COALESCE(${updates.category || null}, category),
          strain_type = COALESCE(${updates.strain_type || null}, strain_type),
          thca_percentage = COALESCE(${updates.thca_percentage || null}, thca_percentage),
          price = COALESCE(${updates.price || null}, price),
          images = COALESCE(${updates.images ? JSON.stringify(updates.images) : null}::jsonb, images),
          hover_image = COALESCE(${updates.hover_image || null}, hover_image),
          video_url = COALESCE(${updates.video_url || null}, video_url),
          description = COALESCE(${updates.description || null}, description),
          effects = COALESCE(${updates.effects ? JSON.stringify(updates.effects) : null}::jsonb, effects),
          featured = COALESCE(${updates.featured !== undefined ? updates.featured : null}, featured),
          inventory = COALESCE(${updates.inventory || null}, inventory),
          coa_document = COALESCE(${updates.coa_document || null}, coa_document),
          in_stock = COALESCE(${updates.in_stock !== undefined ? updates.in_stock : null}, in_stock),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return products.length > 0 ? products[0] as Product : null;
    } catch (error) {
      console.error('Failed to update product:', error);
      return null;
    }
  },

  async updateMedia(id: string, mediaData: {
    images?: string[];
    hover_image?: string;
    video_url?: string;
    coa_document?: string;
  }) {
    try {
      const products = await sql`
        UPDATE products 
        SET 
          images = ${JSON.stringify(mediaData.images || [])},
          hover_image = ${mediaData.hover_image || null},
          video_url = ${mediaData.video_url || null},
          coa_document = ${mediaData.coa_document || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return products.length > 0 ? products[0] as Product : null;
    } catch (error) {
      console.error('Failed to update product media:', error);
      return null;
    }
  },

  async delete(id: string) {
    try {
      await sql`
        UPDATE products 
        SET in_stock = false, updated_at = NOW()
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      return false;
    }
  },

  async search(searchTerm: string) {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE (name ILIKE ${'%' + searchTerm + '%'} 
               OR description ILIKE ${'%' + searchTerm + '%'} 
               OR category ILIKE ${'%' + searchTerm + '%'})
        ORDER BY created_at DESC
      `;
      return (products || []) as Product[];
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  },

  async getByCategory(category: string) {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
      return (products || []) as Product[];
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return [];
    }
  },

  async getFeatured() {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE featured = true
        ORDER BY created_at DESC
      `;
      return (products || []) as Product[];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }
};
