import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser, ApiResponse, LoginCredentials, RegisterData } from '../types/shared';
import { api } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.login(credentials.email, credentials.password) as ApiResponse<{ user: AuthUser; token: string }>;
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            api.setAuthToken(token);
            await SecureStore.setItemAsync('auth_token', token);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.register(data) as ApiResponse<{ user: AuthUser; token: string }>;
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            api.setAuthToken(token);
            await SecureStore.setItemAsync('auth_token', token);
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
        }
        
        api.setAuthToken(null);
        await SecureStore.deleteItemAsync('auth_token');
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
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
          await get().logout();
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load user'
          });
        }
      },

      refreshUser: async () => {
        const token = await SecureStore.getItemAsync('auth_token');
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        try {
          api.setAuthToken(token);
          
          const response = await api.getMe() as ApiResponse<AuthUser>;
          
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
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export const initializeAuth = async () => {
  const authStore = useAuthStore.getState();
  await authStore.refreshUser();
};
