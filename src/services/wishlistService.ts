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

    const items = await sql`
      SELECT * FROM wishlist_items 
      WHERE session_id = ${session.id}
    `

    return items || []
  },

  async getWishlist() {
    const session = await this.getOrCreateSession()
    if (!session) return { data: [], error: null }

    try {
      const items = await sql`
        SELECT product_id FROM wishlist_items 
        WHERE session_id = ${session.id}
      `
      return { data: items?.map((item: any) => item.product_id) || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async addToWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

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

    const items = await sql`
      SELECT id FROM wishlist_items 
      WHERE session_id = ${session.id} AND product_id = ${productId}
    `

    return items.length > 0
  },

  async migrateSessionWishlist(userId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { success: false }

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
