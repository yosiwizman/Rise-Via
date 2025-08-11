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

  const initializeSession = async () => {
    console.log('🔵 Initializing wishlist session...');
    await migrateLocalStorageWishlist();
    await loadWishlist();
  };

  const migrateFromLocalStorage = async () => {
    await migrateLocalStorageWishlist();
  };

  const generateShareLink = async (): Promise<string> => {
    const shareCode = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = window.location.origin;
    return `${baseUrl}/wishlist/shared/${shareCode}`;
  };

  const importWishlist = async (shareCode: string): Promise<boolean> => {
    try {
      console.log('🔵 Importing wishlist with share code:', shareCode);
      return true;
    } catch (error) {
      console.error('❌ Failed to import wishlist:', error);
      return false;
    }
  };

  const clearWishlist = async () => {
    setWishlistItems([]);
    localStorage.removeItem('risevia-wishlist');
  };

  const updateItemPriority = async (itemId: string, priority: 'low' | 'medium' | 'high') => {
    console.log('🔵 Updating item priority:', itemId, priority);
  };

  const setPriceAlert = async (itemId: string, targetPrice: number) => {
    console.log('🔵 Setting price alert for item:', itemId, 'target price:', targetPrice);
  };

  const removePriceAlert = async (itemId: string) => {
    console.log('🔵 Removing price alert for item:', itemId);
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item?.category === category);
  };

  const getItemsByPriority = (priority: 'low' | 'medium' | 'high') => {
    return items.filter(item => item?.priority === priority);
  };

  const sortItems = (sortBy: 'name' | 'price' | 'dateAdded' | 'priority') => {
    return [...items].sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'dateAdded':
          return b.dateAdded - a.dateAdded;
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        default:
          return 0;
      }
    });
  };

  return {
    wishlistItems,
    loading,
    error,
    items,
    stats,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    initializeSession,
    migrateFromLocalStorage,
    generateShareLink,
    importWishlist,
    clearWishlist,
    updateItemPriority,
    setPriceAlert,
    removePriceAlert,
    getItemsByCategory,
    getItemsByPriority,
    sortItems
  }
}
