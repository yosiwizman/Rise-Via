import { useState, useEffect } from 'react'
import { wishlistService } from '../services/wishlistService'
import productsData from '../data/products.json'

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    migrateLocalStorageWishlist()
    loadWishlist()
  }, [])

  const migrateLocalStorageWishlist = async () => {
    const localWishlist = localStorage.getItem('risevia-wishlist')
    if (localWishlist) {
      try {
        const { state } = JSON.parse(localWishlist)
        if (state?.items && Array.isArray(state.items)) {
          for (const item of state.items) {
            const productId = item.id || item.name
            if (productId) {
              await wishlistService.addToWishlist(productId)
            }
          }
          localStorage.removeItem('risevia-wishlist')
          console.log('✅ Wishlist migrated to database')
        }
      } catch (error) {
        console.error('Migration failed:', error)
      }
    }
  }

  const loadWishlist = async () => {
    setLoading(true)
    const { data, error } = await wishlistService.getWishlist()
    if (error) {
      setError(typeof error === 'string' ? error : 'An error occurred')
    } else {
      setWishlistItems(data || [])
    }
    setLoading(false)
  }

  const addToWishlist = async (item: any) => {
    const productId = item.id
    const { error } = await wishlistService.addToWishlist(productId)
    if (!error) {
      await loadWishlist()
    } else {
      setError(typeof error === 'string' ? error : 'An error occurred')
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    const { error } = await wishlistService.removeFromWishlist(itemId)
    if (!error) {
      await loadWishlist()
    } else {
      setError(typeof error === 'string' ? error : 'An error occurred')
    }
  }

  const isInWishlist = (itemId: string) => {
    return wishlistItems.includes(itemId)
  }

  const getWishlistCount = () => {
    return wishlistItems.length
  }

  const items = wishlistItems.map(productId => {
    const product = productsData.products.find(p => p.id === productId)
    if (product) {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        effects: product.effects,
        dateAdded: Date.now(),
        priority: 'medium' as const
      }
    }
    return null
  }).filter(Boolean)

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item?.price || 0), 0),
    averagePrice: items.length > 0 ? items.reduce((sum, item) => sum + (item?.price || 0), 0) / items.length : 0,
    categoryCounts: {},
    priorityCounts: { low: 0, medium: items.length, high: 0 },
    dateCreated: Date.now(),
    lastUpdated: Date.now()
  }

  return {
    wishlistItems,
    loading,
    error,
    items,
    stats,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount
  }
}
