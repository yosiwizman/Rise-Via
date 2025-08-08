const mockNeon = () => {
  return async (query: TemplateStringsArray, ...values: unknown[]) => {
    console.log('Mock Neon Query:', query.join('?'), values);
    return [];
  };
};

const sql = mockNeon();

export interface WishlistSession {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  session_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  added_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
}

export const neonService = {
  async createWishlistSession(sessionId: string): Promise<WishlistSession> {
    try {
      const result = await sql`
        INSERT INTO wishlist_sessions (session_id, created_at, updated_at)
        VALUES (${sessionId}, NOW(), NOW())
        ON CONFLICT (session_id) DO UPDATE SET updated_at = NOW()
        RETURNING *
      `;
      return result[0] as WishlistSession;
    } catch (error) {
      console.error('Error creating wishlist session:', error);
      throw error;
    }
  },

  async getWishlistItems(sessionId: string): Promise<WishlistItem[]> {
    try {
      const result = await sql`
        SELECT wi.* FROM wishlist_items wi
        JOIN wishlist_sessions ws ON wi.session_id = ws.session_id
        WHERE ws.session_id = ${sessionId}
        ORDER BY wi.added_at DESC
      `;
      return result as WishlistItem[];
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }
  },

  async addWishlistItem(sessionId: string, product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  }): Promise<WishlistItem> {
    try {
      await this.createWishlistSession(sessionId);
      
      const result = await sql`
        INSERT INTO wishlist_items (session_id, product_id, product_name, product_price, product_image, product_category, added_at)
        VALUES (${sessionId}, ${product.id}, ${product.name}, ${product.price}, ${product.image}, ${product.category}, NOW())
        ON CONFLICT (session_id, product_id) DO UPDATE SET added_at = NOW()
        RETURNING *
      `;
      return result[0] as WishlistItem;
    } catch (error) {
      console.error('Error adding wishlist item:', error);
      throw error;
    }
  },

  async removeWishlistItem(sessionId: string, productId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM wishlist_items 
        WHERE session_id = ${sessionId} AND product_id = ${productId}
      `;
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      throw error;
    }
  },

  async clearWishlist(sessionId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM wishlist_items 
        WHERE session_id = ${sessionId}
      `;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  },

  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews 
        WHERE product_id = ${productId}
        ORDER BY created_at DESC
      `;
      return result as Review[];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  async addProductReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    try {
      const result = await sql`
        INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, verified_purchase, created_at, updated_at)
        VALUES (${review.product_id}, ${review.customer_name}, ${review.customer_email}, ${review.rating}, ${review.title}, ${review.comment}, ${review.verified_purchase}, NOW(), NOW())
        RETURNING *
      `;
      return result[0] as Review;
    } catch (error) {
      console.error('Error adding product review:', error);
      throw error;
    }
  },

  async validateCoupon(code: string, orderAmount: number): Promise<Coupon | null> {
    try {
      const result = await sql`
        SELECT * FROM coupons 
        WHERE code = ${code} 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR current_uses < max_uses)
        AND (min_order_amount IS NULL OR ${orderAmount} >= min_order_amount)
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as Coupon;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return null;
    }
  },

  async applyCoupon(code: string): Promise<void> {
    try {
      await sql`
        UPDATE coupons 
        SET current_uses = current_uses + 1 
        WHERE code = ${code}
      `;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  async createDatabaseTables(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255) NOT NULL,
          comment TEXT,
          verified_purchase BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
          discount_value DECIMAL(10,2) NOT NULL,
          min_order_amount DECIMAL(10,2),
          max_uses INTEGER,
          current_uses INTEGER DEFAULT 0,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS abandoned_carts (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255),
          cart_data JSONB NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          last_updated TIMESTAMP DEFAULT NOW(),
          recovery_email_sent BOOLEAN DEFAULT false,
          recovered BOOLEAN DEFAULT false
        )
      `;

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }
};

export { sql };
export default neonService;
