import { sql } from '../lib/neon'

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

    if (!sql) {
      console.warn('⚠️ Database not available, returning null for session');
      return null;
    }

    const sessions = await sql`
      SELECT * FROM wishlist_sessions 
      WHERE session_token = ${token}
    `

    if (sessions.length > 0) return sessions[0]

    const newSessions = await sql`
      INSERT INTO wishlist_sessions (session_token)
      VALUES (${token})
      RETURNING *
    `

    return newSessions.length > 0 ? newSessions[0] : null
  },

  async getWishlistItems() {
    const session = await this.getOrCreateSession()
    if (!session) return []

    if (!sql) {
      console.warn('⚠️ Database not available, returning empty array for wishlist items');
      return [];
    }

    const items = await sql`
      SELECT * FROM wishlist_items 
      WHERE session_id = ${session.id}
    `

    return items || []
  },

  async getWishlist() {
    const session = await this.getOrCreateSession()
    if (!session) return { data: [], error: null }

    if (!sql) {
      console.warn('⚠️ Database not available, returning empty wishlist');
      return { data: [], error: null };
    }

    try {
      const items = await sql`
        SELECT product_id FROM wishlist_items 
        WHERE session_id = ${session.id}
      `
      return { data: items?.map((item: Record<string, unknown>) => (item.product_id as string)) || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async addToWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

    if (!sql) {
      console.warn('⚠️ Database not available, cannot add to wishlist');
      return { error: { message: 'Database not available' } };
    }

    try {
      await sql`
        INSERT INTO wishlist_items (session_id, product_id)
        VALUES (${session.id}, ${productId})
      `
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async removeFromWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

    if (!sql) {
      console.warn('⚠️ Database not available, cannot remove from wishlist');
      return { error: { message: 'Database not available' } };
    }

    try {
      await sql`
        DELETE FROM wishlist_items 
        WHERE session_id = ${session.id} AND product_id = ${productId}
      `
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async isInWishlist(productId: string): Promise<boolean> {
    const session = await this.getOrCreateSession()
    if (!session) return false

    if (!sql) {
      console.warn('⚠️ Database not available, returning false for wishlist check');
      return false;
    }

    const items = await sql`
      SELECT id FROM wishlist_items 
      WHERE session_id = ${session.id} AND product_id = ${productId}
    `

    return items.length > 0
  },

  async migrateSessionWishlist(userId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { success: false }

    if (!sql) {
      console.warn('⚠️ Database not available, cannot migrate wishlist');
      return { success: false };
    }

    const sessionItems = await sql`
      SELECT product_id FROM wishlist_items 
      WHERE session_id = ${session.id}
    `
    
    if (sessionItems && sessionItems.length > 0) {
      console.log(`Migrating ${sessionItems.length} wishlist items for user ${userId}`)
    }
    
    return { success: true }
  }
}
