import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser, ApiResponse } from '../types/shared';
import { api } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse<{ user: AuthUser; token: string }>>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    date_of_birth: string;
  }) => Promise<ApiResponse<{ user: AuthUser; token: string }>>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.login(email, password);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed'
            });
          }
          
          return response;
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return {
            success: false,
            error: errorMessage
          };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.register(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            set({
              isLoading: false,
              error: response.error || 'Registration failed'
            });
          }
          
          return response;
        } catch (error) {
          console.error('Registration error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return {
            success: false,
            error: errorMessage
          };
        }
      },

      logout: async () => {
        try {
          await api.logout();
          await SecureStore.deleteItemAsync('auth_token');
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const token = await SecureStore.getItemAsync('auth_token');
          if (!token) {
            set({ isLoading: false });
            return;
          }
          
          const response = await api.getProfile();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            await get().logout();
            set({
              isLoading: false,
              error: response.error || 'Failed to load user'
            });
          }
        } catch (error) {
          console.error('Load user error:', error);
          await get().logout();
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load user'
          });
        }
      },

      updateProfile: async (userData: Partial<AuthUser>) => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }
          
          const updatedUser = { ...currentUser, ...userData };
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Update profile error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
