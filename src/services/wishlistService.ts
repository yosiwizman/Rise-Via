import { supabase } from '../lib/supabase'

export const wishlistService = {
  getSessionId: () => {
    let sessionId = localStorage.getItem('wishlist_session_id')
    if (!sessionId) {
      sessionId = `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('wishlist_session_id', sessionId)
    }
    return sessionId
  },

  getWishlist: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('customer_id', user.id)
        .order('added_at', { ascending: false })
      
      if (error) return { data: [], error }
      return { data: data?.map(item => item.product_id) || [], error: null }
    } else {
      const sessionId = wishlistService.getSessionId()
      const { data, error } = await supabase
        .from('wishlist_sessions')
        .select('product_id')
        .eq('session_id', sessionId)
        .order('added_at', { ascending: false })
      
      if (error) return { data: [], error }
      return { data: data?.map(item => item.product_id) || [], error: null }
    }
  },

  addToWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          customer_id: user.id,
          product_id: productId
        })
        .select()
        .single()
      
      return { data, error }
    } else {
      const sessionId = wishlistService.getSessionId()
      const { data, error } = await supabase
        .from('wishlist_sessions')
        .insert({
          session_id: sessionId,
          product_id: productId
        })
        .select()
        .single()
      
      return { data, error }
    }
  },

  removeFromWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('customer_id', user.id)
        .eq('product_id', productId)
      
      return { error }
    } else {
      const sessionId = wishlistService.getSessionId()
      const { error } = await supabase
        .from('wishlist_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('product_id', productId)
      
      return { error }
    }
  },

  isInWishlist: async (productId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('customer_id', user.id)
        .eq('product_id', productId)
        .single()
      
      return !!data
    } else {
      const sessionId = wishlistService.getSessionId()
      const { data } = await supabase
        .from('wishlist_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('product_id', productId)
        .single()
      
      return !!data
    }
  },

  migrateSessionWishlist: async (userId: string) => {
    const sessionId = wishlistService.getSessionId()
    
    const { data: sessionItems } = await supabase
      .from('wishlist_sessions')
      .select('product_id')
      .eq('session_id', sessionId)
    
    if (sessionItems && sessionItems.length > 0) {
      for (const item of sessionItems) {
        await supabase
          .from('wishlist_items')
          .upsert({
            customer_id: userId,
            product_id: item.product_id
          }, {
            onConflict: 'customer_id,product_id'
          })
      }
      
      await supabase
        .from('wishlist_sessions')
        .delete()
        .eq('session_id', sessionId)
    }
  }
}
