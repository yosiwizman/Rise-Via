import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem, CartStats } from '../types/cart';
import { SecurityUtils } from '../utils/security';
import { cartAnalytics } from '../analytics/cartAnalytics';
import { abandonedCartService } from '../services/abandonedCartService';

const STORAGE_KEY = 'risevia-cart';

const initialStats: CartStats = {
  totalItems: 0,
  totalValue: 0,
  itemCount: 0,
  dateCreated: Date.now(),
  lastUpdated: Date.now()
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      stats: initialStats,
      isOpen: false,
      isLoading: false,
      error: null,

      addToCart: (itemData, quantity = 1) => {
        const state = get();
        
        if (!SecurityUtils.checkRateLimit('cart_add', 30, 60000)) {
          set({ error: 'Too many requests. Please wait before adding more items.' });
          return;
        }

        const sanitizedName = SecurityUtils.sanitizeInput(itemData.name);
        const existingItem = state.items.find(item => item.productId === itemData.productId);

        if (existingItem) {
          const updatedItems = state.items.map(item =>
            item.productId === itemData.productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          const updatedStats = calculateStats(updatedItems);
          
          set({
            items: updatedItems,
            stats: updatedStats,
            error: null
          });

          trackCartEvent('add', existingItem, { quantity });
        } else {
          const newItem: CartItem = {
            ...itemData,
            id: crypto.randomUUID(),
            name: sanitizedName,
            quantity,
            dateAdded: Date.now()
          };

          const updatedItems = [...state.items, newItem];
          const updatedStats = calculateStats(updatedItems);

          set({
            items: updatedItems,
            stats: updatedStats,
            error: null
          });

          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('cart-item-added', {
              detail: { name: sanitizedName, quantity }
            }));
          }

          trackCartEvent('add', newItem, { quantity });
          cartAnalytics.trackCartEvent('add', newItem, { quantity });
          abandonedCartService.trackCartActivity();
        }
      },

      removeFromCart: (itemId) => {
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

        trackCartEvent('remove', itemToRemove);
        cartAnalytics.trackCartEvent('remove', itemToRemove);
        abandonedCartService.trackCartActivity();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const updatedStats = calculateStats(updatedItems);

        set({
          items: updatedItems,
          stats: updatedStats
        });
        
        abandonedCartService.trackCartActivity();
      },

      clearCart: () => {
        set({
          items: [],
          stats: { ...initialStats, dateCreated: Date.now() },
          error: null
        });

        trackCartEvent('clear');
        cartAnalytics.trackCartEvent('clear');
      },

      isInCart: (productId) => {
        const state = get();
        return state.items.some(item => item.productId === productId);
      },

      getCartCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
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

function calculateStats(items: CartItem[]): CartStats {
  const totalItems = items.length;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    totalItems,
    totalValue,
    itemCount,
    dateCreated: Date.now(),
    lastUpdated: Date.now()
  };
}

function trackCartEvent(
  action: 'add' | 'remove' | 'update' | 'clear',
  item?: CartItem,
  metadata?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as { gtag: (...args: unknown[]) => void }).gtag('event', `cart_${action}`, {
      event_category: 'cart',
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

  const existingAnalytics = JSON.parse(localStorage.getItem('cart_analytics') || '[]');
  existingAnalytics.push(analyticsData);
  
  if (existingAnalytics.length > 1000) {
    existingAnalytics.splice(0, existingAnalytics.length - 1000);
  }
  
  localStorage.setItem('cart_analytics', JSON.stringify(existingAnalytics));
}
