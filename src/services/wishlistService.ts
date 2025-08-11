const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (wishlistService):', query, values);
    
    if (query.includes('wishlist_sessions')) {
      if (query.includes('INSERT')) {
        return Promise.resolve([{
          id: 'mock-session-id',
          session_token: values[0] || 'mock-token',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      }
      return Promise.resolve([{
        id: 'mock-session-id',
        session_token: 'mock-token',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
    
    if (query.includes('wishlist_items')) {
      if (query.includes('SELECT product_id')) {
        return Promise.resolve([
          { id: 'mock-item-1', session_id: 'mock-session-id', product_id: 'mock-product-1', created_at: new Date().toISOString() },
          { id: 'mock-item-2', session_id: 'mock-session-id', product_id: 'mock-product-2', created_at: new Date().toISOString() }
        ]);
      }
      if (query.includes('SELECT id')) {
        return Promise.resolve([{ id: 'mock-item-id', session_id: 'mock-session-id', product_id: 'mock-product-1', created_at: new Date().toISOString() }]);
      }
      if (query.includes('SELECT *')) {
        return Promise.resolve([{
          id: 'mock-item-id',
          session_id: 'mock-session-id',
          product_id: 'mock-product-1',
          created_at: new Date().toISOString()
        }]);
      }
      if (query.includes('INSERT') || query.includes('DELETE')) {
        return Promise.resolve([]);
      }
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
) as any;

const getSessionToken = () => {
  let token = localStorage.getItem('wishlist_session_token')
  if (!token) {
    token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('wishlist_session_token', token)
  }
  return token
}

export interface WishlistSession {
  id: string
  session_token: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string
  session_id: string
  product_id: string
  created_at: string
}

export const wishlistService = {
  async getOrCreateSession() {
    const token = getSessionToken()
    
    const existingSessions = await sql('SELECT * FROM wishlist_sessions WHERE session_token = ?', token);

    if (existingSessions.length > 0) return existingSessions[0];

    const newSessions = await sql('INSERT INTO wishlist_sessions (session_token, created_at) VALUES (?, NOW()) RETURNING *', token);

    return newSessions[0];
  },

  async getWishlistItems() {
    const session = await this.getOrCreateSession()
    if (!session) return []

    const items = await sql('SELECT * FROM wishlist_items WHERE session_id = ?', session.id);

    return items || []
  },

  async getWishlist() {
    const session = await this.getOrCreateSession()
    if (!session) return { data: [], error: null }

    try {
      const items = await sql('SELECT product_id FROM wishlist_items WHERE session_id = ?', session.id);

      return { data: items.map((item: any) => item.product_id) || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async addToWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

    try {
      await sql('INSERT INTO wishlist_items (session_id, product_id, created_at) VALUES (?, ?, NOW())', session.id, productId);

      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async removeFromWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to get session' } }

    try {
      await sql('DELETE FROM wishlist_items WHERE session_id = ? AND product_id = ?', session.id, productId);

      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async isInWishlist(productId: string): Promise<boolean> {
    const session = await this.getOrCreateSession()
    if (!session) return false

    const items = await sql('SELECT id FROM wishlist_items WHERE session_id = ? AND product_id = ?', session.id, productId);

    return items.length > 0
  },

  async migrateSessionWishlist(userId: string) {
    const session = await this.getOrCreateSession();
    if (!session) return;

    const sessionItems = await sql('SELECT product_id FROM wishlist_items WHERE session_id = ?', session.id);

    if (!sessionItems?.length) return;

    try {
      for (const item of sessionItems) {
        await sql('INSERT INTO wishlist_items (user_id, product_id, created_at) VALUES (?, ?, NOW())', userId, item.product_id);
      }

      await sql('DELETE FROM wishlist_items WHERE session_id = ?', session.id);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}
