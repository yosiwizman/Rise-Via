import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem, CartStats, QuantityBreak, BundleSuggestion } from '../types/cart';
import { SecurityUtils } from '../utils/security';
import { cartAnalytics } from '../analytics/cartAnalytics';

const STORAGE_KEY = 'risevia-cart';

const initialStats: CartStats = {
  totalItems: 0,
  totalValue: 0,
  itemCount: 0,
  dateCreated: Date.now(),
  lastUpdated: Date.now(),
  subtotal: 0,
  tax: 0,
  estimatedDelivery: 'Next business day',
  progress: {
    current: 0,
    target: 75,
    benefit: 'free delivery',
    percentage: 0
  }
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
        const quantityBreaks = calculateQuantityBreaks(itemData.price);
        const bundleSuggestions = generateBundleSuggestions(itemData);
        const existingItem = state.items.find(item => item.productId === itemData.productId);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          const updatedPrice = applyQuantityBreaks(itemData.price, newQuantity, quantityBreaks);
          
          const updatedItems = state.items.map(item =>
            item.productId === itemData.productId
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  price: updatedPrice,
                  quantityBreaks,
                  bundleSuggestions
                }
              : item
          );
          const updatedStats = calculateStats(updatedItems);
          
          set({
            items: updatedItems,
            stats: updatedStats,
            error: null
          });
        } else {
          const newItem: CartItem = {
            ...itemData,
            id: crypto.randomUUID(),
            name: sanitizedName,
            originalPrice: itemData.price,
            quantity,
            dateAdded: Date.now(),
            quantityBreaks,
            bundleSuggestions
          };

          const updatedItems = [...state.items, newItem];
          const updatedStats = calculateStats(updatedItems);

          set({
            items: updatedItems,
            stats: updatedStats,
            error: null
          });

          trackCartEvent('add', newItem, { quantity });
          cartAnalytics.trackCartEvent('add', newItem, { quantity });
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

function calculateQuantityBreaks(basePrice: number): QuantityBreak[] {
  return [
    {
      minQuantity: 3,
      discountPercentage: 5,
      discountedPrice: basePrice * 0.95
    },
    {
      minQuantity: 5,
      discountPercentage: 10,
      discountedPrice: basePrice * 0.90
    },
    {
      minQuantity: 10,
      discountPercentage: 15,
      discountedPrice: basePrice * 0.85
    }
  ];
}

function generateBundleSuggestions(itemData: any): BundleSuggestion[] {
  const suggestions = [
    {
      productId: 'bundle-suggestion-1',
      name: itemData.strainType === 'indica' ? 'Similar relaxing strain' : 'Similar energizing strain',
      additionalQuantity: 2,
      discountPercentage: 10,
      message: 'Add 2 more grams for 10% off total order'
    }
  ];
  
  return suggestions;
}

function applyQuantityBreaks(basePrice: number, quantity: number, breaks: QuantityBreak[]): number {
  const applicableBreak = breaks
    .filter(b => quantity >= b.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];
  
  return applicableBreak ? applicableBreak.discountedPrice : basePrice;
}

function calculateStats(items: CartItem[]): CartStats {
  const totalItems = items.length;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const totalValue = subtotal + tax;
  
  const progressTarget = 75;
  const progressCurrent = subtotal;
  const progressPercentage = Math.min((progressCurrent / progressTarget) * 100, 100);

  return {
    totalItems,
    totalValue,
    itemCount,
    subtotal,
    tax,
    dateCreated: Date.now(),
    lastUpdated: Date.now(),
    estimatedDelivery: subtotal >= progressTarget ? 'Next business day (FREE)' : '2-3 business days',
    progress: {
      current: progressCurrent,
      target: progressTarget,
      benefit: 'free delivery',
      percentage: progressPercentage
    }
  };
}

function trackCartEvent(
  action: 'add' | 'remove' | 'update' | 'clear',
  item?: any,
  metadata?: Record<string, any>
) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', `cart_${action}`, {
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
