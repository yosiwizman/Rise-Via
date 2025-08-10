import * as SecureStore from 'expo-secure-store';
import type { AuthUser, Product, Review, CartItem, ApiResponse } from '../types/shared';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = __DEV__ ? 'http://localhost:5173' : 'https://rise-via.vercel.app';
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        await SecureStore.setItemAsync('auth_token', data.token);
      }

      return { success: true, data: { user: data.user, token: data.token } };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    date_of_birth: string;
  }): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) {
        await SecureStore.setItemAsync('auth_token', data.token);
      }

      return { success: true, data: { user: data.user, token: data.token } };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  }

  async getProfile(): Promise<ApiResponse<AuthUser>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Get profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      };
    }
  }

  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(`${this.baseURL}/api/products`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      return { success: true, data: data.products || [] };
    } catch (error) {
      console.error('Get products error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      };
    }
  }

  async getProductDetails(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product details');
      }
      
      return { success: true, data: data.product };
    } catch (error) {
      console.error('Get product details error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch product details' 
      };
    }
  }

  async addToWishlist(productId: string): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to wishlist');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add to wishlist' 
      };
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove from wishlist' 
      };
    }
  }

  async getWishlist(): Promise<ApiResponse<Product[]>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }
      
      return { success: true, data: data.wishlist || [] };
    } catch (error) {
      console.error('Get wishlist error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch wishlist' 
      };
    }
  }

  async clearWishlist(): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/wishlist`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear wishlist');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Clear wishlist error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear wishlist' 
      };
    }
  }

  async syncWishlist(productIds: string[]): Promise<ApiResponse<Product[]>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/wishlist/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_ids: productIds }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync wishlist');
      }
      
      return { success: true, data: data.wishlist || [] };
    } catch (error) {
      console.error('Sync wishlist error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync wishlist' 
      };
    }
  }

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/${productId}/reviews`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
      
      return { success: true, data: data.reviews || [] };
    } catch (error) {
      console.error('Get reviews error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch reviews' 
      };
    }
  }

  async submitReview(productId: string, review: { rating: number; comment: string }): Promise<ApiResponse<Review>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(review),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      return { success: true, data: data.review };
    } catch (error) {
      console.error('Submit review error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit review' 
      };
    }
  }

  async getCart(): Promise<ApiResponse<CartItem[]>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      
      return { success: true, data: data.cart || [] };
    } catch (error) {
      console.error('Get cart error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch cart' 
      };
    }
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add to cart' 
      };
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart item');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update cart item error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update cart item' 
      };
    }
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from cart');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove from cart' 
      };
    }
  }

  async clearCart(): Promise<ApiResponse<void>> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Clear cart error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear cart' 
      };
    }
  }
}

export const api = new ApiClient();
