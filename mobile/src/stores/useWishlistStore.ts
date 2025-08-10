import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../types/shared';
import { api } from '../services/api';

interface WishlistState {
  wishlistItems: Product[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  loadWishlist: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      isLoading: false,
      error: null,

      addToWishlist: async (product: Product) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.addToWishlist(product.id);
          if (response.success) {
            set(state => ({
              wishlistItems: [...state.wishlistItems, product],
              isLoading: false
            }));
          } else {
            throw new Error('Failed to add to wishlist');
          }
        } catch (error) {
          console.error('Add to wishlist error:', error);
          set({ 
            error: 'Failed to add item to wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      removeFromWishlist: async (productId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.removeFromWishlist(productId);
          if (response.success) {
            set(state => ({
              wishlistItems: state.wishlistItems.filter(item => item.id !== productId),
              isLoading: false
            }));
          } else {
            throw new Error('Failed to remove from wishlist');
          }
        } catch (error) {
          console.error('Remove from wishlist error:', error);
          set({ 
            error: 'Failed to remove item from wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      clearWishlist: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.clearWishlist();
          if (response.success) {
            set({ wishlistItems: [], isLoading: false });
          } else {
            throw new Error('Failed to clear wishlist');
          }
        } catch (error) {
          console.error('Clear wishlist error:', error);
          set({ 
            error: 'Failed to clear wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      loadWishlist: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.getWishlist();
          if (response.success && response.data) {
            set({ 
              wishlistItems: response.data,
              isLoading: false 
            });
          } else {
            throw new Error('Failed to load wishlist');
          }
        } catch (error) {
          console.error('Load wishlist error:', error);
          set({ 
            error: 'Failed to load wishlist',
            isLoading: false 
          });
        }
      },

      syncWithServer: async () => {
        try {
          const { wishlistItems } = get();
          const response = await api.syncWishlist(wishlistItems.map(item => item.id));
          
          if (response.success && response.data) {
            set({ wishlistItems: response.data });
          }
        } catch (error) {
          console.error('Sync wishlist error:', error);
        }
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ wishlistItems: state.wishlistItems }),
    }
  )
);
