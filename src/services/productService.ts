import { sql } from '../lib/neon';
import { Product, InventoryLog, InventoryAlert } from '../types/product';

export const productService = {
  async createTables() {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping table creation');
        return;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sample_id VARCHAR(50),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255),
          category VARCHAR(100),
          strain_type VARCHAR(50),
          thca_percentage DECIMAL(5,2),
          batch_id VARCHAR(100),
          volume_available INTEGER DEFAULT 0,
          price DECIMAL(10,2),
          prices JSONB,
          images JSONB DEFAULT '[]',
          hover_image TEXT,
          video_url TEXT,
          description TEXT,
          effects JSONB DEFAULT '[]',
          flavors JSONB DEFAULT '[]',
          featured BOOLEAN DEFAULT false,
          inventory INTEGER DEFAULT 0,
          coa_document TEXT,
          in_stock BOOLEAN DEFAULT true,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS inventory_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id),
          change_amount INTEGER,
          reason VARCHAR(255),
          previous_count INTEGER,
          new_count INTEGER,
          user_id VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS inventory_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id),
          alert_type VARCHAR(50),
          threshold INTEGER,
          current_value INTEGER,
          resolved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  },

  async getAll(): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array for products');
        return [];
      }

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

  async getById(id: string): Promise<Product | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for product');
        return null;
      }

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

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning null for product creation');
        return null;
      }

      const products = await sql`
        INSERT INTO products (
          sample_id, name, slug, category, strain_type, thca_percentage, 
          batch_id, volume_available, price, prices, images, hover_image, 
          video_url, description, effects, flavors, featured, inventory, 
          coa_document, in_stock, status
        )
        VALUES (
          ${product.sample_id || null}, 
          ${product.name}, 
          ${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}, 
          ${product.category}, 
          ${product.strain_type || null}, 
          ${product.thca_percentage || null}, 
          ${product.batch_id || null},
          ${product.volume_available || product.inventory || 0},
          ${product.price || null},
          ${product.prices ? JSON.stringify(product.prices) : null},
          ${JSON.stringify(product.images || [])}, 
          ${product.hover_image || null}, 
          ${product.video_url || null}, 
          ${product.description}, 
          ${JSON.stringify(product.effects || [])}, 
          ${JSON.stringify(product.flavors || [])},
          ${product.featured || false}, 
          ${product.inventory || product.volume_available || 0}, 
          ${product.coa_document || null}, 
          ${product.in_stock !== false},
          ${product.status || 'active'}
        )
        RETURNING *
      `;
      return products.length > 0 ? products[0] as Product : null;
    } catch (error) {
      console.error('Failed to create product:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      if (Object.keys(updates).length === 0) return null;

      if (!sql) {
        console.warn('⚠️ Database not available, returning null for product update');
        return null;
      }

      const products = await sql`
        UPDATE products 
        SET 
          sample_id = COALESCE(${updates.sample_id || null}, sample_id),
          name = COALESCE(${updates.name || null}, name),
          slug = COALESCE(${updates.slug || null}, slug),
          category = COALESCE(${updates.category || null}, category),
          strain_type = COALESCE(${updates.strain_type || null}, strain_type),
          thca_percentage = COALESCE(${updates.thca_percentage || null}, thca_percentage),
          batch_id = COALESCE(${updates.batch_id || null}, batch_id),
          volume_available = COALESCE(${updates.volume_available || null}, volume_available),
          price = COALESCE(${updates.price || null}, price),
          prices = COALESCE(${updates.prices ? JSON.stringify(updates.prices) : null}::jsonb, prices),
          images = COALESCE(${updates.images ? JSON.stringify(updates.images) : null}::jsonb, images),
          hover_image = COALESCE(${updates.hover_image || null}, hover_image),
          video_url = COALESCE(${updates.video_url || null}, video_url),
          description = COALESCE(${updates.description || null}, description),
          effects = COALESCE(${updates.effects ? JSON.stringify(updates.effects) : null}::jsonb, effects),
          flavors = COALESCE(${updates.flavors ? JSON.stringify(updates.flavors) : null}::jsonb, flavors),
          featured = COALESCE(${updates.featured !== undefined ? updates.featured : null}, featured),
          inventory = COALESCE(${updates.inventory || null}, inventory),
          coa_document = COALESCE(${updates.coa_document || null}, coa_document),
          in_stock = COALESCE(${updates.in_stock !== undefined ? updates.in_stock : null}, in_stock),
          status = COALESCE(${updates.status || null}, status),
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

  async updateInventory(productId: string, newCount: number, reason: string, userId?: string): Promise<void> {
    try {
      const product = await this.getById(productId);
      if (!product) throw new Error('Product not found');

      const previousCount = product.volume_available || product.inventory || 0;
      const changeAmount = newCount - previousCount;

      if (!sql) {
        console.warn('⚠️ Database not available, cannot update inventory');
        throw new Error('Database not available');
      }

      await sql`
        UPDATE products 
        SET volume_available = ${newCount}, inventory = ${newCount}, updated_at = NOW()
        WHERE id = ${productId}
      `;

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
    } catch (error) {
      console.error('Failed to update inventory:', error);
      throw error;
    }
  },

  async logInventoryChange(log: Omit<InventoryLog, 'id' | 'created_at'>): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping inventory log');
        return;
      }

      await sql`
        INSERT INTO inventory_logs (product_id, change_amount, reason, previous_count, new_count, user_id)
        VALUES (${log.product_id}, ${log.change_amount}, ${log.reason}, ${log.previous_count}, ${log.new_count}, ${log.user_id || null})
      `;
    } catch (error) {
      console.error('Failed to log inventory change:', error);
      throw error;
    }
  },

  async createInventoryAlert(alert: Omit<InventoryAlert, 'id' | 'created_at'>): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, skipping inventory alert');
        return;
      }

      await sql`
        INSERT INTO inventory_alerts (product_id, alert_type, threshold, current_value, resolved)
        VALUES (${alert.product_id}, ${alert.alert_type}, ${alert.threshold}, ${alert.current_value}, ${alert.resolved})
      `;
    } catch (error) {
      console.error('Failed to create inventory alert:', error);
      throw error;
    }
  },

  async getInventoryLogs(productId?: string): Promise<InventoryLog[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty inventory logs');
        return [];
      }

      let products;
      if (productId) {
        products = await sql`
          SELECT * FROM inventory_logs 
          WHERE product_id = ${productId}
          ORDER BY created_at DESC
        `;
      } else {
        products = await sql`
          SELECT * FROM inventory_logs 
          ORDER BY created_at DESC
        `;
      }
      return (products || []) as InventoryLog[];
    } catch (error) {
      console.error('Failed to fetch inventory logs:', error);
      return [];
    }
  },

  async getInventoryAlerts(resolved: boolean = false): Promise<InventoryAlert[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty inventory alerts');
        return [];
      }

      const alerts = await sql`
        SELECT * FROM inventory_alerts 
        WHERE resolved = ${resolved}
        ORDER BY created_at DESC
      `;
      return (alerts || []) as InventoryAlert[];
    } catch (error) {
      console.error('Failed to fetch inventory alerts:', error);
      return [];
    }
  },

  async resolveAlert(alertId: string): Promise<void> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot resolve alert');
        throw new Error('Database not available');
      }

      await sql`
        UPDATE inventory_alerts 
        SET resolved = true, updated_at = NOW()
        WHERE id = ${alertId}
      `;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  },

  async search(searchTerm: string, filters: {
    strainType?: string;
    thcaRange?: { min: number; max: number };
    effects?: string[];
    priceRange?: { min: number; max: number };
  } = {}): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty array');
        return [];
      }

      let query = sql`SELECT * FROM products WHERE 1=1`;
      
      if (searchTerm) {
        if (!sql) {
          console.warn('⚠️ Database not available, returning empty array');
          return [];
        }
        query = sql`
          SELECT * FROM products 
          WHERE (name ILIKE ${'%' + searchTerm + '%'} 
                 OR description ILIKE ${'%' + searchTerm + '%'})
        `;
      }

      if (filters.strainType && filters.strainType !== 'all') {
        const products = await sql`
          SELECT * FROM products 
          WHERE strain_type = ${filters.strainType}
          ${searchTerm ? sql`AND (name ILIKE ${'%' + searchTerm + '%'} OR description ILIKE ${'%' + searchTerm + '%'})` : sql``}
          ORDER BY name
        `;
        return (products || []) as Product[];
      }

      const products = await query;
      return (products || []) as Product[];
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  },

  async getByCategory(category: string): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty products array');
        return [];
      }

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

  async getFeatured(): Promise<Product[]> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty featured products');
        return [];
      }

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
