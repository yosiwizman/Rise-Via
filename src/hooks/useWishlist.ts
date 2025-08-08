import { create } from 'zustand';
import { WishlistStore, WishlistItem, WishlistStats, PriceAlert } from '../types/wishlist';
import { SecurityUtils } from '../utils/security';
import { wishlistAnalytics } from '../analytics/wishlistAnalytics';
import { wishlistDb } from '../lib/neon';


const initialStats: WishlistStats = {
  totalItems: 0,
  totalValue: 0,
  averagePrice: 0,
  categoryCounts: {},
  priorityCounts: { low: 0, medium: 0, high: 0 },
  dateCreated: Date.now(),
  lastUpdated: Date.now()
};

const getSessionToken = (): string => {
  let sessionToken = sessionStorage.getItem('risevia_wishlist_session');
  if (!sessionToken) {
    sessionToken = crypto.randomUUID();
    sessionStorage.setItem('risevia_wishlist_session', sessionToken);
  }
  return sessionToken;
};

const mapDbItemToWishlistItem = (dbItem: any): WishlistItem => ({
  id: dbItem.id,
  name: dbItem.name,
  price: parseFloat(dbItem.price),
  image: dbItem.image,
  category: dbItem.category,
  thcContent: dbItem.thc_content,
  cbdContent: dbItem.cbd_content,
  effects: dbItem.effects ? JSON.parse(dbItem.effects) : undefined,
  priority: dbItem.priority,
  priceAlert: dbItem.price_alert ? JSON.parse(dbItem.price_alert) : undefined,
  dateAdded: dbItem.created_at ? new Date(dbItem.created_at).getTime() : Date.now()
});

export const useWishlist = create<WishlistStore>()((set, get) => ({
  items: [],
  stats: initialStats,
  isLoading: false,
  error: null,
  sessionToken: getSessionToken(),
  sessionId: null,

  initializeSession: async () => {
    const state = get();
    if (state.sessionId) return;

    set({ isLoading: true, error: null });

    try {
      const sessionToken = state.sessionToken;
      
      let { data: sessionData, error: sessionError } = await wishlistDb.getSession(sessionToken);
      
      if (sessionError || !sessionData || sessionData.length === 0) {
        const { data: newSession, error: createError } = await wishlistDb.createSession(sessionToken);
        if (createError) throw createError;
        sessionData = newSession;
      }

      const sessionId = sessionData?.[0]?.id;
      if (!sessionId) throw new Error('Failed to get session ID');

      const { data: itemsData, error: itemsError } = await wishlistDb.getItems(sessionId);
      if (itemsError) throw itemsError;

      const items = itemsData ? itemsData.map(mapDbItemToWishlistItem) : [];

      set({
        sessionId,
        items,
        stats: calculateStats(items),
        isLoading: false,
        error: null
      });

      await get().migrateFromLocalStorage();
    } catch (error) {
      console.error('Failed to initialize wishlist session:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize session' 
      });
    }
  },

  migrateFromLocalStorage: async () => {
    const localStorageKey = 'risevia-wishlist';
    const localData = localStorage.getItem(localStorageKey);
    
    if (!localData) return;

    try {
      const parsedData = JSON.parse(localData);
      const localItems = parsedData?.state?.items || [];
      
      if (localItems.length === 0) {
        localStorage.removeItem(localStorageKey);
        return;
      }

      const state = get();
      if (!state.sessionId) return;

      for (const item of localItems) {
        const existingItem = state.items.find(dbItem => 
          dbItem.name === item.name && dbItem.category === item.category
        );
        
        if (!existingItem) {
          await wishlistDb.addItem(state.sessionId, {
            ...item,
            product_id: item.id
          });
        }
      }

      const { data: itemsData, error } = await wishlistDb.getItems(state.sessionId);
      if (!error && itemsData) {
        const items = itemsData.map(mapDbItemToWishlistItem);
        set({
          items,
          stats: calculateStats(items)
        });
      }

      localStorage.removeItem(localStorageKey);
    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
    }
  },

  addToWishlist: async (itemData) => {
        const state = get();
        
        if (!SecurityUtils.checkRateLimit('wishlist_add', 20, 60000)) {
          set({ error: 'Too many requests. Please wait before adding more items.' });
          return;
        }

        const sanitizedName = SecurityUtils.sanitizeInput(itemData.name);
        const sanitizedCategory = SecurityUtils.sanitizeInput(itemData.category);

        const newItem: WishlistItem = {
          ...itemData,
          id: crypto.randomUUID(),
          name: sanitizedName,
          category: sanitizedCategory,
          dateAdded: Date.now(),
          priority: 'medium'
        };

        if (state.items.some(item => item.name === newItem.name)) {
          set({ error: 'Item already in wishlist' });
          return;
        }

        const updatedItems = [...state.items, newItem];
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats,
          error: null
        });

        trackWishlistEvent('add', newItem);
        wishlistAnalytics.trackWishlistEvent('add', newItem);
      },

  removeFromWishlist: async (itemId) => {
    const state = get();
    const itemToRemove = state.items.find(item => item.id === itemId);
    
    if (!itemToRemove) return;

    set({ isLoading: true, error: null });

    try {
      const { error } = await wishlistDb.removeItem(itemId);
      if (error) throw error;

      const updatedItems = state.items.filter(item => item.id !== itemId);
      const updatedStats = calculateStats(updatedItems);

      set({
        items: updatedItems,
        stats: updatedStats,
        isLoading: false,
        error: null
      });

      trackWishlistEvent('remove', itemToRemove);
      wishlistAnalytics.trackWishlistEvent('remove', itemToRemove);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      
      const updatedItems = state.items.filter(item => item.id !== itemId);
      const updatedStats = calculateStats(updatedItems);

      set({
        items: updatedItems,
        stats: updatedStats,
        isLoading: false,
        error: null
      });

      trackWishlistEvent('remove', itemToRemove);
      wishlistAnalytics.trackWishlistEvent('remove', itemToRemove);
    }
  },

  updateItemPriority: async (itemId, priority) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const { error } = await wishlistDb.updateItem(itemId, { priority });
      if (error) throw error;

      const updatedItems = state.items.map(item =>
        item.id === itemId ? { ...item, priority } : item
      );
      const updatedStats = calculateStats(updatedItems);

      set({
        items: updatedItems,
        stats: updatedStats,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to update item priority:', error);
      
      const updatedItems = state.items.map(item =>
        item.id === itemId ? { ...item, priority } : item
      );
      const updatedStats = calculateStats(updatedItems);

      set({
        items: updatedItems,
        stats: updatedStats,
        isLoading: false
      });
    }
  },

  clearWishlist: async () => {
    const state = get();
    if (!state.sessionId) return;

    set({ isLoading: true, error: null });

    try {
      const { error } = await wishlistDb.clearItems(state.sessionId);
      if (error) throw error;

      set({
        items: [],
        stats: { ...initialStats, dateCreated: Date.now() },
        isLoading: false,
        error: null
      });

      trackWishlistEvent('clear');
      wishlistAnalytics.trackWishlistEvent('clear');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      
      set({
        items: [],
        stats: { ...initialStats, dateCreated: Date.now() },
        isLoading: false,
        error: null
      });

      trackWishlistEvent('clear');
      wishlistAnalytics.trackWishlistEvent('clear');
    }
  },

      isInWishlist: (itemId) => {
        const state = get();
        return state.items.some(item => item.id === itemId || item.name === itemId);
      },

      getWishlistCount: () => {
        return get().items.length;
      },

      generateShareLink: async () => {
        const state = get();
        
        if (state.items.length === 0) {
          throw new Error('Cannot share empty wishlist');
        }

        const shareCode = crypto.randomUUID();
        const shareData = {
          items: state.items,
          shareCode,
          createdAt: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        const existingShares = JSON.parse(localStorage.getItem('wishlist_shares') || '[]');
        existingShares.push(shareData);
        localStorage.setItem('wishlist_shares', JSON.stringify(existingShares));

        const shareUrl = `${window.location.origin}/wishlist/shared/${shareCode}`;
        
        trackWishlistEvent('share', undefined, { shareCode, itemCount: state.items.length });
        wishlistAnalytics.trackWishlistEvent('share', undefined, { shareCode, itemCount: state.items.length });
        
        return shareUrl;
      },

      importWishlist: async (shareCode) => {
        try {
          const existingShares = JSON.parse(localStorage.getItem('wishlist_shares') || '[]');
          const shareData = existingShares.find((share: any) => share.shareCode === shareCode);

          if (!shareData) {
            throw new Error('Share code not found');
          }

          if (shareData.expiresAt && Date.now() > shareData.expiresAt) {
            throw new Error('Share link has expired');
          }

          const state = get();
          const newItems = shareData.items.filter((sharedItem: WishlistItem) =>
            !state.items.some(existingItem => existingItem.name === sharedItem.name)
          );

          if (newItems.length === 0) {
            set({ error: 'All items from shared wishlist are already in your wishlist' });
            return false;
          }

          const itemsToAdd = newItems.map((item: WishlistItem) => ({
            ...item,
            id: crypto.randomUUID(),
            dateAdded: Date.now()
          }));

          const updatedItems = [...state.items, ...itemsToAdd];
          const updatedStats = calculateStats(updatedItems);

          set({
            items: updatedItems,
            stats: updatedStats,
            error: null
          });

          trackWishlistEvent('import', undefined, { shareCode, importedCount: itemsToAdd.length });
          wishlistAnalytics.trackWishlistEvent('import', undefined, { shareCode, importedCount: itemsToAdd.length });

          return true;
        } catch (error) {
          set({ error: (error as Error).message });
          return false;
        }
      },

  setPriceAlert: async (itemId, targetPrice) => {
    const state = get();
    const priceAlert = {
      targetPrice,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    set({ isLoading: true, error: null });

    try {
      const { error } = await wishlistDb.updateItem(itemId, { price_alert: priceAlert });
      if (error) throw error;

      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          const fullPriceAlert: PriceAlert = {
            id: crypto.randomUUID(),
            itemId,
            targetPrice,
            currentPrice: item.price,
            isActive: true,
            createdAt: Date.now(),
            notificationSent: false
          };
          return { ...item, priceAlert: fullPriceAlert };
        }
        return item;
      });

      set({
        items: updatedItems,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to set price alert:', error);
      
      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          const fullPriceAlert: PriceAlert = {
            id: crypto.randomUUID(),
            itemId,
            targetPrice,
            currentPrice: item.price,
            isActive: true,
            createdAt: Date.now(),
            notificationSent: false
          };
          return { ...item, priceAlert: fullPriceAlert };
        }
        return item;
      });

      set({
        items: updatedItems,
        isLoading: false
      });
    }
  },

  removePriceAlert: async (itemId) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const { error } = await wishlistDb.updateItem(itemId, { price_alert: null });
      if (error) throw error;

      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          const { priceAlert: _, ...itemWithoutAlert } = item;
          return itemWithoutAlert;
        }
        return item;
      });

      set({
        items: updatedItems,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to remove price alert:', error);
      
      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          const { priceAlert: _, ...itemWithoutAlert } = item;
          return itemWithoutAlert;
        }
        return item;
      });

      set({
        items: updatedItems,
        isLoading: false
      });
    }
  },

      getItemsByCategory: (category) => {
        return get().items.filter(item => item.category === category);
      },

      getItemsByPriority: (priority) => {
        return get().items.filter(item => item.priority === priority);
      },

      sortItems: (sortBy) => {
        const items = [...get().items];
        
        switch (sortBy) {
          case 'name':
            return items.sort((a, b) => a.name.localeCompare(b.name));
          case 'price':
            return items.sort((a, b) => b.price - a.price);
          case 'dateAdded':
            return items.sort((a, b) => b.dateAdded - a.dateAdded);
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          default:
            return items;
        }
      }
}));

function calculateStats(items: WishlistItem[]): WishlistStats {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

  const categoryCounts = items.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const priorityCounts = items.reduce((counts, item) => {
    counts[item.priority] = (counts[item.priority] || 0) + 1;
    return counts;
  }, { low: 0, medium: 0, high: 0 });

  return {
    totalItems,
    totalValue,
    averagePrice,
    categoryCounts,
    priorityCounts,
    dateCreated: Date.now(),
    lastUpdated: Date.now()
  };
}

function trackWishlistEvent(
  action: 'add' | 'remove' | 'share' | 'import' | 'clear',
  item?: WishlistItem,
  metadata?: Record<string, any>
) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', `wishlist_${action}`, {
      event_category: 'wishlist',
      event_label: item?.name || 'bulk_action',
      value: item?.price || 0,
      ...metadata
    });
  }

  const analyticsData = {
    action,
    timestamp: Date.now(),
    itemName: item?.name,
    itemPrice: item?.price,
    itemCategory: item?.category,
    ...metadata
  };

  const existingAnalytics = JSON.parse(localStorage.getItem('wishlist_analytics') || '[]');
  existingAnalytics.push(analyticsData);
  
  if (existingAnalytics.length > 1000) {
    existingAnalytics.splice(0, existingAnalytics.length - 1000);
  }
  
  localStorage.setItem('wishlist_analytics', JSON.stringify(existingAnalytics));
}
