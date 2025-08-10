import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { AuthState, LoginCredentials, RegisterData, ApiResponse } from '../types/shared';
import { api, apiClient } from '../services/api';

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('SecureStore error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore error:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        
        try {
          const response = await api.login(credentials.email, credentials.password) as ApiResponse<{ user: any; token: string }>;
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            apiClient.setAuthToken(token);
            
            await SecureStore.setItemAsync('auth_token', token);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        
        try {
          const response = await api.register(data) as ApiResponse<{ user: any; token: string }>;
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            apiClient.setAuthToken(token);
            
            await SecureStore.setItemAsync('auth_token', token);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
        }
        
        apiClient.setAuthToken(null);
        
        await SecureStore.deleteItemAsync('auth_token');
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshUser: async () => {
        const token = await SecureStore.getItemAsync('auth_token');
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        try {
          apiClient.setAuthToken(token);
          
          const response = await apiClient.getMe() as ApiResponse<any>;
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
            });
          } else {
            await get().logout();
          }
        } catch {
          await get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const initializeAuth = async () => {
  const authStore = useAuthStore.getState();
  await authStore.refreshUser();
};
