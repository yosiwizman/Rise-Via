import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product, CartItem } from '../types/shared';
import { api } from '../services/api';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  totalPrice: number;
  addItem: (product: Product, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  updateTotals: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      itemCount: 0,
      totalPrice: 0,

      addItem: async (product: Product, quantity: number) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.addToCart(product.id, quantity);
          if (response.success) {
            const existingItem = get().items.find(item => item.product.id === product.id);
            
            if (existingItem) {
              set(state => ({
                items: state.items.map(item =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
                isLoading: false
              }));
            } else {
              const newItem: CartItem = {
                id: `${product.id}-${Date.now()}`,
                product,
                quantity,
                added_at: new Date().toISOString()
              };
              
              set(state => ({
                items: [...state.items, newItem],
                isLoading: false
              }));
            }
            
            get().updateTotals();
          } else {
            throw new Error('Failed to add to cart');
          }
        } catch (error) {
          set({ 
            error: 'Failed to add item to cart',
            isLoading: false 
          });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.removeFromCart(itemId);
          if (response.success) {
            set(state => ({
              items: state.items.filter(item => item.id !== itemId),
              isLoading: false
            }));
            get().updateTotals();
          } else {
            throw new Error('Failed to remove from cart');
          }
        } catch (error) {
          set({ 
            error: 'Failed to remove item from cart',
            isLoading: false 
          });
          throw error;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        try {
          set({ isLoading: true, error: null });
          
          if (quantity <= 0) {
            await get().removeItem(itemId);
            return;
          }
          
          const response = await api.updateCartItem(itemId, quantity);
          if (response.success) {
            set(state => ({
              items: state.items.map(item =>
                item.id === itemId ? { ...item, quantity } : item
              ),
              isLoading: false
            }));
            get().updateTotals();
          } else {
            throw new Error('Failed to update cart item');
          }
        } catch (error) {
          set({ 
            error: 'Failed to update cart item',
            isLoading: false 
          });
          throw error;
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.clearCart();
          if (response.success) {
            set({ 
              items: [], 
              itemCount: 0, 
              totalPrice: 0, 
              isLoading: false 
            });
          } else {
            throw new Error('Failed to clear cart');
          }
        } catch (error) {
          set({ 
            error: 'Failed to clear cart',
            isLoading: false 
          });
          throw error;
        }
      },

      loadCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.getCart();
          if (response.success && response.data) {
            set({ 
              items: response.data,
              isLoading: false 
            });
            get().updateTotals();
          } else {
            throw new Error('Failed to load cart');
          }
        } catch (error) {
          set({ 
            error: 'Failed to load cart',
            isLoading: false 
          });
        }
      },

      syncWithServer: async () => {
        try {
          const response = await api.getCart();
          
          if (response.success && response.data) {
            set({ items: response.data });
            get().updateTotals();
          }
        } catch (error) {
        }
      },

      updateTotals: () => {
        const { items } = get();
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        set({ itemCount, totalPrice });
      },

      getCartTotal: () => {
        return get().totalPrice;
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.updateTotals();
        }
      },
    }
  )
);

export const syncCartWithServer = async () => {
  try {
    const response = await api.getCart();
    
    if (response.success && response.data) {
      const cartStore = useCartStore.getState();
      cartStore.clearCart();
      
      response.data.forEach((item: CartItem) => {
        cartStore.addItem(item.product, item.quantity);
      });
    }
  } catch (error) {
  }
};
