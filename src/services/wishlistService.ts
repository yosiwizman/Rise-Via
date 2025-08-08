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
    
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('session_id', session.id)
    
    if (error) console.error('Error fetching wishlist items:', error)
    return data || []
  },
  
  async addToWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return false
    
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        session_id: session.id,
        product_id: productId
      })
    
    if (error) console.error('Error adding to wishlist:', error)
    return !error
  },
  
  async removeFromWishlist(productId: string) {
    const session = await this.getOrCreateSession()
    if (!session) return false
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('session_id', session.id)
      .eq('product_id', productId)
    
    if (error) console.error('Error removing from wishlist:', error)
    return !error
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

  async getWishlist() {
    const items = await this.getWishlistItems()
    return { data: items.map(item => item.product_id) || [], error: null }
  }
}
