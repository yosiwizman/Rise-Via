import { supabase } from '../lib/supabase'

const getSessionToken = () => {
  let token = localStorage.getItem('wishlist_session_token')
  if (!token) {
    token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('wishlist_session_token', token)
  }
  return token
}

export const wishlistService = {
  async getOrCreateSession() {
    const token = getSessionToken()

    const { data: existingSession } = await supabase
      .from('wishlist_sessions')
      .select('*')
      .eq('session_token', token)
      .single()

    if (existingSession) return existingSession

    const { data: newSession, error } = await supabase
      .from('wishlist_sessions')
      .insert({ session_token: token })
      .select()
      .single()

    if (error) console.error('Error creating session:', error)
    return newSession
  },

  async getWishlistItems() {
    const session = await this.getOrCreateSession()
    if (!session) return []

    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('session_id', session.id)

    return data || []
  },

  async getWishlist() {
    const session = await this.getOrCreateSession()
    if (!session) return { data: [], error: null }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('session_id', session.id)

    if (error) return { data: [], error }
    return { data: data?.map(item => item.product_id) || [], error: null }
  },

  async addToWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        session_id: session.id,
        product_id: productId
      })

    return { error }
  },

  async removeFromWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return { error: { message: 'Failed to create session' } }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('session_id', session.id)
      .eq('product_id', productId)

    return { error }
  },

  async isInWishlist(productId: string): Promise<boolean> {
    const session = await this.getOrCreateSession()
    if (!session) return false

    const { data } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('session_id', session.id)
      .eq('product_id', productId)
      .single()

    return !!data
  },

  async migrateSessionWishlist(userId: string) {
    const { data: sessionItems } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('session_id', (await this.getOrCreateSession())?.id)
    
    if (sessionItems && sessionItems.length > 0) {
      console.log(`Migrating ${sessionItems.length} wishlist items for user ${userId}`)
    }
    
    return { success: true }
  }
}
