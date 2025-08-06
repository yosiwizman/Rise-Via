import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WishlistStore, WishlistItem, WishlistStats, PriceAlert } from '../types/wishlist';
import { SecurityUtils } from '../utils/security';
import { wishlistAnalytics } from '../analytics/wishlistAnalytics';

const STORAGE_KEY = 'risevia-wishlist';

const initialStats: WishlistStats = {
  totalItems: 0,
  totalValue: 0,
  averagePrice: 0,
  categoryCounts: {},
  priorityCounts: { low: 0, medium: 0, high: 0 },
  dateCreated: Date.now(),
  lastUpdated: Date.now()
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      stats: initialStats,
      isLoading: false,
      error: null,

      addToWishlist: (itemData) => {
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

      removeFromWishlist: (itemId) => {
        const state = get();
        const itemToRemove = state.items.find(item => item.id === itemId);
        
        if (!itemToRemove) return;

        const updatedItems = state.items.filter(item => item.id !== itemId);
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats,
          error: null
        });

        trackWishlistEvent('remove', itemToRemove);
        wishlistAnalytics.trackWishlistEvent('remove', itemToRemove);
      },

      updateItemPriority: (itemId, priority) => {
        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === itemId ? { ...item, priority } : item
        );
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats
        });
      },

      clearWishlist: () => {
        set({
          items: [],
          stats: { ...initialStats, dateCreated: Date.now() },
          error: null
        });

        trackWishlistEvent('clear');
        wishlistAnalytics.trackWishlistEvent('clear');
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

      setPriceAlert: (itemId, targetPrice) => {
        const state = get();
        const updatedItems = state.items.map(item => {
          if (item.id === itemId) {
            const priceAlert: PriceAlert = {
              id: crypto.randomUUID(),
              itemId,
              targetPrice,
              currentPrice: item.price,
              isActive: true,
              createdAt: Date.now(),
              notificationSent: false
            };
            return { ...item, priceAlert };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      removePriceAlert: (itemId) => {
        const state = get();
        const updatedItems = state.items.map(item => {
          if (item.id === itemId) {
            const { priceAlert: _, ...itemWithoutAlert } = item;
            return itemWithoutAlert;
          }
          return item;
        });

        set({ items: updatedItems });
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
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        stats: state.stats
      })
    }
  )
);

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
