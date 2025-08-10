import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartState, CartItem, Product, ApiResponse } from '../types/shared';
import { api } from '../services/api';

const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error('AsyncStorage error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: async (product: Product, quantity: number = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
          await get().updateQuantity(product.id, existingItem.quantity + quantity);
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            added_at: new Date().toISOString(),
          };

          const newItems = [...currentItems, newItem];
          const newTotal = calculateTotal(newItems);
          const newItemCount = calculateItemCount(newItems);

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          });

          try {
            await api.addToCart(product.id, quantity);
          } catch (error) {
            console.error('Failed to sync cart with server:', error);
          }
        }
      },

      removeItem: async (productId: string) => {
        const currentItems = get().items;
        const newItems = currentItems.filter(item => item.product.id !== productId);
        const newTotal = calculateTotal(newItems);
        const newItemCount = calculateItemCount(newItems);

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });

        try {
          await api.removeFromCart(productId);
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        const newTotal = calculateTotal(newItems);
        const newItemCount = calculateItemCount(newItems);

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });

        try {
          await api.updateCartItem(productId, quantity);
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        }
      },

      clearCart: async () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });

        try {
          await api.clearCart();
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        }
      },

      getCartTotal: () => {
        return get().total;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export const syncCartWithServer = async () => {
  try {
    const response = await api.getCart() as ApiResponse<{ items: CartItem[] }>;
    if (response.success && response.data) {
      const serverItems = response.data.items || [];
      const total = calculateTotal(serverItems);
      const itemCount = calculateItemCount(serverItems);

      useCartStore.setState({
        items: serverItems,
        total,
        itemCount,
      });
    }
  } catch (error) {
    console.error('Failed to sync cart with server:', error);
  }
};
