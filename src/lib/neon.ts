import { neon } from '@neondatabase/serverless';

interface DbSessionUpdate {
  user_id?: string;
}

interface DbWishlistItem {
  id?: string;
  product_id?: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  thcContent?: string;
  cbdContent?: string;
  effects?: string[];
  priority?: 'low' | 'medium' | 'high';
  priceAlert?: object;
}

interface DbItemUpdate {
  priority?: 'low' | 'medium' | 'high';
  price_alert?: object | null;
}


const neonConnectionString = import.meta.env?.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('Missing Neon database URL - check VITE_NEON_DATABASE_URL environment variable');
  throw new Error('Missing required Neon database URL');
}

export const neonClient = neon(neonConnectionString);

export async function executeQuery(sql: string, params: (string | number | null | undefined)[] = []) {
  try {
    const result = await neonClient(sql, params);
    return { data: result, error: null };
  } catch (error) {
    console.error('Neon query error:', error);
    return { data: null, error };
  }
}

export const wishlistDb = {
  async createSession(sessionToken: string, userId?: string) {
    const sql = `
      INSERT INTO wishlist_sessions (session_token, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    return executeQuery(sql, [sessionToken, userId]);
  },

  async getSession(sessionToken: string) {
    const sql = `
      SELECT * FROM wishlist_sessions 
      WHERE session_token = $1
    `;
    return executeQuery(sql, [sessionToken]);
  },

  async updateSession(sessionToken: string, updates: DbSessionUpdate) {
    const sql = `
      UPDATE wishlist_sessions 
      SET updated_at = NOW(), user_id = COALESCE($2, user_id)
      WHERE session_token = $1
      RETURNING *
    `;
    return executeQuery(sql, [sessionToken, updates.user_id]);
  },

  async addItem(sessionId: string, item: DbWishlistItem) {
    console.debug('🔄 Neon addItem called:', { sessionId, item });
    const sql = `
      INSERT INTO wishlist_items (
        session_id, product_id, name, price, image, category,
        thc_content, cbd_content, effects, priority, price_alert
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const result = await executeQuery(sql, [
      sessionId, item.product_id || item.id, item.name, item.price, item.image,
      item.category, item.thcContent, item.cbdContent, 
      JSON.stringify(item.effects), item.priority || 'medium', 
      item.priceAlert ? JSON.stringify(item.priceAlert) : null
    ]);
    console.debug('🔄 Neon addItem result:', result);
    return result;
  },

  async getItems(sessionId: string) {
    const sql = `
      SELECT * FROM wishlist_items 
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    return executeQuery(sql, [sessionId]);
  },

  async removeItem(itemId: string) {
    const sql = `
      DELETE FROM wishlist_items 
      WHERE id = $1
      RETURNING *
    `;
    return executeQuery(sql, [itemId]);
  },

  async updateItem(itemId: string, updates: DbItemUpdate) {
    const sql = `
      UPDATE wishlist_items 
      SET priority = COALESCE($2, priority),
          price_alert = COALESCE($3, price_alert)
      WHERE id = $1
      RETURNING *
    `;
    return executeQuery(sql, [
      itemId, 
      updates.priority, 
      updates.price_alert ? JSON.stringify(updates.price_alert) : null
    ]);
  },

  async clearItems(sessionId: string) {
    const sql = `
      DELETE FROM wishlist_items 
      WHERE session_id = $1
      RETURNING *
    `;
    return executeQuery(sql, [sessionId]);
  }
};
