import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { CartStore, CartItem, CartStats } from '../types/cart';
import { SecurityUtils } from '../utils/security';
import { cartAnalytics } from '../analytics/cartAnalytics';

const STORAGE_KEY = 'risevia-supabase-cart';

const initialStats: CartStats = {
  totalItems: 0,
  totalValue: 0,
  itemCount: 0,
  dateCreated: Date.now(),
  lastUpdated: Date.now()
};

interface SupabaseCartStore extends CartStore {
  sessionId: string;
  customerId?: string;
  isLoading: boolean;
  error: string | null;
  syncCart: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<void>;
}

const generateSessionId = () => {
  const stored = localStorage.getItem('risevia-session-id');
  if (stored) return stored;
  
  const sessionId = crypto.randomUUID();
  localStorage.setItem('risevia-session-id', sessionId);
  return sessionId;
};

export const useSupabaseCart = create<SupabaseCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      stats: initialStats,
      isOpen: false,
      isLoading: false,
      error: null,
      sessionId: generateSessionId(),
      customerId: undefined,

      addToCart: async (itemData, quantity = 1) => {
        const state = get();
        
        if (!SecurityUtils.checkRateLimit('cart_add', 30, 60000)) {
          set({ error: 'Too many requests. Please wait before adding more items.' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          SecurityUtils.sanitizeInput(itemData.name);
          
          const { data: initialCart, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq(state.customerId ? 'customer_id' : 'session_id', 
                state.customerId || state.sessionId)
            .single();

          let cart = initialCart;
          
          if (cartError && cartError.code === 'PGRST116') {
            const { data: newCart, error: createError } = await supabase
              .from('carts')
              .insert([{
                ...(state.customerId ? { customer_id: state.customerId } : { session_id: state.sessionId })
              }])
              .select('id')
              .single();

            if (createError) throw createError;
            cart = newCart;
          } else if (cartError) {
            throw cartError;
          }

          if (!cart) {
            throw new Error('Failed to create or retrieve cart');
          }

          const { data: existingItem, error: existingError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', itemData.productId)
            .single();

          if (existingError && existingError.code !== 'PGRST116') {
            throw existingError;
          }

          if (existingItem) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + quantity })
              .eq('id', existingItem.id);

            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from('cart_items')
              .insert([{
                cart_id: cart.id,
                product_id: itemData.productId,
                quantity
              }]);

            if (insertError) throw insertError;
          }

          await get().syncCart();

          const cartItem: CartItem = {
            id: crypto.randomUUID(),
            productId: itemData.productId,
            name: itemData.name,
            price: itemData.price,
            image: itemData.image,
            category: itemData.category,
            strainType: itemData.strainType,
            thcaPercentage: itemData.thcaPercentage,
            quantity,
            dateAdded: Date.now()
          };

          trackCartEvent('add', cartItem, { quantity });
          cartAnalytics.trackCartEvent('add', cartItem, { quantity });

        } catch (error) {
          console.error('Error adding to cart:', error);
          set({ error: 'Failed to add item to cart. Please try again.' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (itemId) => {
        const state = get();
        const itemToRemove = state.items.find(item => item.id === itemId);
        
        if (!itemToRemove) return;

        set({ isLoading: true, error: null });

        try {
          const { data: cartItems, error: findError } = await supabase
            .from('cart_items')
            .select('id')
            .eq('product_id', itemToRemove.productId);

          if (findError) throw findError;

          if (cartItems && cartItems.length > 0) {
            const { error: deleteError } = await supabase
              .from('cart_items')
              .delete()
              .eq('id', cartItems[0].id);

            if (deleteError) throw deleteError;
          }

          await get().syncCart();

          trackCartEvent('remove', itemToRemove);
          cartAnalytics.trackCartEvent('remove', itemToRemove);

        } catch (error) {
          console.error('Error removing from cart:', error);
          set({ error: 'Failed to remove item from cart. Please try again.' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeFromCart(itemId);
          return;
        }

        const state = get();
        const item = state.items.find(item => item.id === itemId);
        
        if (!item) return;

        set({ isLoading: true, error: null });

        try {
          const { data: cartItems, error: findError } = await supabase
            .from('cart_items')
            .select('id')
            .eq('product_id', item.productId);

          if (findError) throw findError;

          if (cartItems && cartItems.length > 0) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity })
              .eq('id', cartItems[0].id);

            if (updateError) throw updateError;
          }

          await get().syncCart();

        } catch (error) {
          console.error('Error updating quantity:', error);
          set({ error: 'Failed to update quantity. Please try again.' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          const { data: cart, error } = await supabase
            .from('carts')
            .select('id')
            .eq(state.customerId ? 'customer_id' : 'session_id', 
                state.customerId || state.sessionId)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (cart) {
            const { error: deleteError } = await supabase
              .from('cart_items')
              .delete()
              .eq('cart_id', cart.id);

            if (deleteError) throw deleteError;
          }

          set({
            items: [],
            stats: { ...initialStats, dateCreated: Date.now() },
            error: null
          });

          trackCartEvent('clear');
          cartAnalytics.trackCartEvent('clear');

        } catch (error) {
          console.error('Error clearing cart:', error);
          set({ error: 'Failed to clear cart. Please try again.' });
        } finally {
          set({ isLoading: false });
        }
      },

      syncCart: async () => {
        const state = get();
        
        try {
          const { data: cart, error } = await supabase
            .from('carts')
            .select(`
              id,
              cart_items (
                id,
                quantity,
                product_id,
                products (
                  id,
                  name,
                  price,
                  images,
                  category,
                  strain,
                  thca_percentage
                )
              )
            `)
            .eq(state.customerId ? 'customer_id' : 'session_id', 
                state.customerId || state.sessionId)
            .single();

          if (error && error.code === 'PGRST116') {
            set({
              items: [],
              stats: { ...initialStats, dateCreated: Date.now() }
            });
            return;
          }

          if (error) throw error;

          const items: CartItem[] = (cart?.cart_items || []).map((item: {
            id: string;
            product_id: string;
            quantity: number;
            products: {
              id: string;
              name: string;
              price: number;
              images: string[];
              category: string;
              strain: string;
              thca_percentage: number;
            }[];
          }) => {
            const product = item.products[0];
            return {
              id: item.id,
              productId: item.product_id,
              name: product.name,
              price: product.price,
              image: product.images[0] || '',
              category: product.category,
              strainType: product.strain,
              thcaPercentage: product.thca_percentage,
              quantity: item.quantity,
              dateAdded: Date.now()
            };
          });

          const stats = calculateStats(items);

          set({ items, stats });

        } catch (error) {
          console.error('Error syncing cart:', error);
          set({ error: 'Failed to sync cart. Please refresh the page.' });
        }
      },

      migrateFromLocalStorage: async () => {
        const oldCartData = localStorage.getItem('risevia-cart');
        if (!oldCartData) return;

        try {
          const oldCart = JSON.parse(oldCartData);
          if (oldCart.state && oldCart.state.items && oldCart.state.items.length > 0) {
            console.log('🔄 Migrating cart from localStorage to Supabase...');
            
            for (const item of oldCart.state.items) {
              await get().addToCart({
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                strainType: item.strainType,
                thcaPercentage: item.thcaPercentage
              }, item.quantity);
            }

            localStorage.removeItem('risevia-cart');
            console.log('✅ Cart migration completed');
          }
        } catch (error) {
          console.error('Error migrating cart:', error);
        }
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
        sessionId: state.sessionId,
        customerId: state.customerId
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
    (window as unknown as { gtag: (event: string, action: string, params: Record<string, unknown>) => void }).gtag('event', `cart_${action}`, {
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

if (typeof window !== 'undefined') {
  const store = useSupabaseCart.getState();
  
  store.migrateFromLocalStorage();
  
  store.syncCart();
  
  setInterval(() => {
    store.syncCart();
  }, 30000);
}
