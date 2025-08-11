import { create } from 'zustand';
import type { WishlistStore, WishlistItem, WishlistStats, PriceAlert } from '../types/wishlist';
import { SecurityUtils } from '../utils/security';
import { wishlistAnalytics } from '../analytics/wishlistAnalytics';
import { sql } from '../lib/neon';
import { toast } from 'sonner';

interface DbItem {
  id: string;
  session_id: string;
  product_id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  thc_content?: string;
  cbd_content?: string;
  effects?: string;
  priority: 'low' | 'medium' | 'high';
  price_alert?: string;
  created_at: string;
}

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

const mapDbItemToWishlistItem = (dbItem: DbItem): WishlistItem => {
  let effects: string[] = [];
  try {
    if (dbItem.effects) {
      if (typeof dbItem.effects === 'string') {
        if (dbItem.effects.startsWith('[') && dbItem.effects.endsWith(']')) {
          effects = JSON.parse(dbItem.effects);
        } else {
          effects = dbItem.effects.split(',').map((effect: string) => effect.trim());
        }
      } else if (Array.isArray(dbItem.effects)) {
        effects = dbItem.effects;
      }
    }
  } catch {
    effects = [];
  }

  let priceAlert;
  try {
    priceAlert = dbItem.price_alert ? JSON.parse(dbItem.price_alert) : undefined;
  } catch {
    priceAlert = undefined;
  }

  return {
    id: dbItem.id,
    name: dbItem.name,
    price: parseFloat(dbItem.price),
    image: dbItem.image,
    category: dbItem.category,
    thcContent: dbItem.thc_content,
    cbdContent: dbItem.cbd_content,
    effects,
    priority: dbItem.priority,
    priceAlert,
    dateAdded: dbItem.created_at ? new Date(dbItem.created_at).getTime() : Date.now()
  };
};

function calculateStats(items: WishlistItem[]): WishlistStats {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

  const categoryCounts: Record<string, number> = {};
  const priorityCounts = { low: 0, medium: 0, high: 0 };

  items.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    priorityCounts[item.priority]++;
  });

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
  action: 'add' | 'remove' | 'clear' | 'share' | 'import',
  item?: WishlistItem,
  metadata?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as { gtag: (...args: unknown[]) => void }).gtag('event', `wishlist_${action}`, {
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

export const useWishlist = create<WishlistStore>()((set, get) => ({
  items: [],
  stats: initialStats,
  isLoading: false,
  error: null,
  sessionToken: getSessionToken(),
  sessionId: null,

  async initializeSession() {
    const state = get();
    if (state.sessionId) return;

    set({ isLoading: true, error: null });

    if (!sql) {
      console.warn('⚠️ Database not available, using localStorage fallback');
      
      const localStorageKey = 'risevia-wishlist-fallback';
      const localData = localStorage.getItem(localStorageKey);
      let localItems: WishlistItem[] = [];
      
      if (localData) {
        try {
          localItems = JSON.parse(localData);
        } catch {
          localItems = [];
        }
      }

      set({
        sessionId: 'localStorage-fallback',
        items: localItems,
        stats: calculateStats(localItems),
        isLoading: false,
        error: null
      });

      toast.success('Wishlist loaded (offline mode)', {
        description: 'Your wishlist will sync when database is available',
        duration: 3000,
      });
      return;
    }

    try {
      const sessionToken = state.sessionToken;

      const sessionData = await sql`SELECT * FROM wishlist_sessions WHERE session_token = ${sessionToken}`;

      let finalSessionData = sessionData;
      if (!sessionData || sessionData.length === 0) {
        const newSession = await sql`
          INSERT INTO wishlist_sessions (session_token, created_at)
          VALUES (${sessionToken}, NOW())
          RETURNING *
        `;
        finalSessionData = newSession;
      }

      const sessionId = finalSessionData?.[0]?.id;
      if (!sessionId) throw new Error('Failed to get session ID');

      const itemsData = await sql`
        SELECT * FROM wishlist_items
        WHERE session_id = ${sessionId}
        ORDER BY created_at DESC
      `;

      const items = itemsData ? (itemsData as DbItem[]).map(mapDbItemToWishlistItem) : [];

      set({
        sessionId,
        items,
        stats: calculateStats(items),
        isLoading: false,
        error: null
      });

      await get().migrateFromLocalStorage();
    } catch (error) {
      console.error('Database failed, falling back to localStorage:', error);
      
      const localStorageKey = 'risevia-wishlist-fallback';
      const localData = localStorage.getItem(localStorageKey);
      let localItems: WishlistItem[] = [];
      
      if (localData) {
        try {
          localItems = JSON.parse(localData);
        } catch {
          localItems = [];
        }
      }

      set({
        sessionId: 'localStorage-fallback',
        items: localItems,
        stats: calculateStats(localItems),
        isLoading: false,
        error: null
      });

      toast.success('Wishlist loaded (offline mode)', {
        description: 'Your wishlist will sync when database is available',
        duration: 3000,
      });
    }
  },

  async migrateFromLocalStorage() {
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
          if (!sql) {
            console.warn('⚠️ Database not available, skipping wishlist migration');
            return;
          }
          await sql`
            INSERT INTO wishlist_items (session_id, product_id, name, price, image, category, priority)
            VALUES (${state.sessionId}, ${item.id}, ${item.name}, ${item.price}, ${item.image || ''}, ${item.category}, 'medium')
          `;
        }
      }

      if (!sql) {
        console.warn('⚠️ Database not available, skipping wishlist sync');
        return;
      }

      const itemsData = await sql`
        SELECT * FROM wishlist_items
        WHERE session_id = ${state.sessionId}
        ORDER BY created_at DESC
      `;
      if (itemsData) {
        const items = (itemsData as DbItem[]).map(mapDbItemToWishlistItem);
        set({
          items,
          stats: calculateStats(items)
        });
      }

      localStorage.removeItem(localStorageKey);
    } catch {
      set({ error: 'Failed to migrate localStorage data' });
      toast.error('Failed to migrate localStorage wishlist');
    }
  },

  async addToWishlist(itemData) {
    const state = get();

    if (!SecurityUtils.checkRateLimit('wishlist_add', 20, 60000)) {
      set({ error: 'Too many requests. Please wait before adding more items.' });
      toast.error('Too many requests. Please wait before adding more items.');
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
      toast.error('Item already in wishlist');
      return;
    }

    if (!state.sessionId) {
      await get().initializeSession();
    }

    const currentState = get();
    if (!currentState.sessionId) {
      set({ error: 'Failed to initialize session' });
      toast.error('Failed to initialize session');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      if (currentState.sessionId === 'localStorage-fallback') {
        // localStorage fallback mode
        const updatedItems = [...currentState.items, newItem];
        const updatedStats = calculateStats(updatedItems);
        
        localStorage.setItem('risevia-wishlist-fallback', JSON.stringify(updatedItems));

        set({
          items: updatedItems,
          stats: updatedStats,
          isLoading: false,
          error: null
        });

        toast.success(`${newItem.name} added to wishlist!`, {
          description: `$${newItem.price} • ${newItem.category} (offline mode)`,
          duration: 3000,
        });
      } else {
        if (!sql) {
          console.warn('⚠️ Database not available, item added to localStorage only');
        } else {
          await sql`
            INSERT INTO wishlist_items (
              session_id, product_id, name, price, image, category,
              thc_content, cbd_content, effects, priority
            )
            VALUES (
              ${currentState.sessionId}, ${newItem.id}, ${newItem.name}, ${newItem.price},
              ${newItem.image || ''}, ${newItem.category}, ${newItem.thcContent || null},
              ${newItem.cbdContent || null}, ${JSON.stringify(newItem.effects || [])}, ${newItem.priority}
            )
          `;
        }

        const updatedItems = [...currentState.items, newItem];
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats,
          isLoading: false,
          error: null
        });

        toast.success(`${newItem.name} added to wishlist!`, {
          description: `$${newItem.price} • ${newItem.category}`,
          duration: 3000,
        });
      }

      trackWishlistEvent('add', newItem);
      wishlistAnalytics.trackWishlistEvent('add', newItem);

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add item to wishlist'
      });
      toast.error('Failed to add item to wishlist');
    }
  },

  async removeFromWishlist(itemId) {
    const state = get();
    const itemToRemove = state.items.find(item => item.id === itemId);

    if (!itemToRemove) return;

    set({ isLoading: true, error: null });

    try {
      if (state.sessionId === 'localStorage-fallback') {
        // localStorage fallback mode
        const updatedItems = state.items.filter(item => item.id !== itemId);
        const updatedStats = calculateStats(updatedItems);
        
        localStorage.setItem('risevia-wishlist-fallback', JSON.stringify(updatedItems));

        set({
          items: updatedItems,
          stats: updatedStats,
          isLoading: false,
          error: null
        });
      } else {
        if (!sql) {
          console.warn('⚠️ Database not available, item removed from localStorage only');
        } else {
          await sql`DELETE FROM wishlist_items WHERE id = ${itemId}`;
        }

        const updatedItems = state.items.filter(item => item.id !== itemId);
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats,
          isLoading: false,
          error: null
        });
      }

      trackWishlistEvent('remove', itemToRemove);
      wishlistAnalytics.trackWishlistEvent('remove', itemToRemove);

      toast.success(`${itemToRemove.name} removed from wishlist`, {
        description: 'Item successfully removed',
        duration: 2000,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from wishlist'
      });
      toast.error('Failed to remove item from wishlist');
    }
  },

  async updateItemPriority(itemId, priority) {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      if (!sql) {
        console.warn('⚠️ Database not available, priority updated in localStorage only');
      } else {
        await sql`UPDATE wishlist_items SET priority = ${priority} WHERE id = ${itemId}`;
      }

      const updatedItems = state.items.map(item =>
        item.id === itemId ? { ...item, priority } : item
      );
      const updatedStats = calculateStats(updatedItems);

      set({
        items: updatedItems,
        stats: updatedStats,
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
      toast.error('Failed to update item priority');
    }
  },

  async clearWishlist() {
    const state = get();
    if (!state.sessionId) return;

    set({ isLoading: true, error: null });

    try {
      if (!sql) {
        console.warn('⚠️ Database not available, wishlist cleared from localStorage only');
      } else {
        await sql`DELETE FROM wishlist_items WHERE session_id = ${state.sessionId}`;
      }

      set({
        items: [],
        stats: { ...initialStats, dateCreated: Date.now() },
        isLoading: false,
        error: null
      });

      trackWishlistEvent('clear');
      wishlistAnalytics.trackWishlistEvent('clear');
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to clear wishlist'
      });
      toast.error('Failed to clear wishlist');
    }
  },

  isInWishlist(itemId) {
    const state = get();
    return state.items.some(item => item.id === itemId || item.name === itemId);
  },

  getWishlistCount() {
    return get().items.length;
  },

  async generateShareLink() {
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

  async importWishlist(shareCode) {
    try {
      const existingShares = JSON.parse(localStorage.getItem('wishlist_shares') || '[]');
      const shareData = existingShares.find((share: { shareCode: string }) => share.shareCode === shareCode);

      if (!shareData) {
        set({ error: 'Share code not found' });
        toast.error('Share code not found');
        return false;
      }

      if (shareData.expiresAt && Date.now() > shareData.expiresAt) {
        set({ error: 'Share link has expired' });
        toast.error('Share link has expired');
        return false;
      }

      const state = get();
      const newItems = shareData.items.filter((sharedItem: WishlistItem) =>
        !state.items.some(existingItem => existingItem.name === sharedItem.name)
      );

      if (newItems.length === 0) {
        set({ error: 'All items from shared wishlist are already in your wishlist' });
        toast.error('All items from shared wishlist are already in your wishlist');
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

      toast.success(`Imported ${itemsToAdd.length} items from shared wishlist`);
      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to import wishlist');
      return false;
    }
  },

  async setPriceAlert(itemId, targetPrice) {
    const state = get();
    const priceAlert = {
      targetPrice,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    set({ isLoading: true, error: null });

    try {
      if (!sql) {
        console.warn('⚠️ Database not available, price alert set in localStorage only');
      } else {
        await sql`UPDATE wishlist_items SET price_alert = ${JSON.stringify(priceAlert)} WHERE id = ${itemId}`;
      }

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
    } catch {
      set({ isLoading: false });
      toast.error('Failed to set price alert');
    }
  },

  async removePriceAlert(itemId) {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      if (!sql) {
        console.warn('⚠️ Database not available, price alert removed from localStorage only');
      } else {
        await sql`UPDATE wishlist_items SET price_alert = NULL WHERE id = ${itemId}`;
      }

      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { priceAlert, ...itemWithoutAlert } = item;
          return itemWithoutAlert;
        }
        return item;
      });

      set({
        items: updatedItems,
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
      toast.error('Failed to remove price alert');
    }
  },

  getItemsByCategory(category) {
    return get().items.filter(item => item.category === category);
  },

  getItemsByPriority(priority) {
    return get().items.filter(item => item.priority === priority);
  },

  sortItems(sortBy) {
    const items = [...get().items];

    switch (sortBy) {
      case 'name': {
        return items.sort((a, b) => a.name.localeCompare(b.name));
      }
      case 'price': {
        return items.sort((a, b) => b.price - a.price);
      }
      case 'dateAdded': {
        return items.sort((a, b) => b.dateAdded - a.dateAdded);
      }
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      }
      default:
        return items;
    }
  }
}));
