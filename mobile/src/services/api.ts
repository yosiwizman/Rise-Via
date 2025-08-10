import * as SecureStore from 'expo-secure-store';
import type { AuthUser, Product, Review, CartItem, ApiResponse, RegisterData } from '../types/shared';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173/api' 
  : 'https://rise-via.vercel.app/api';

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await SecureStore.getItemAsync('auth_token');
    } catch {
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!this.authToken) {
      try {
        this.authToken = await SecureStore.getItemAsync('auth_token');
      } catch {
      }
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await this.request<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await this.request<{ user: AuthUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/auth/logout', {
      method: 'POST',
    });

    this.authToken = null;
    await SecureStore.deleteItemAsync('auth_token');

    return response;
  }

  async getProfile(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/profile');
  }

  async getMe(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/me');
  }

  async getProducts(filters?: {
    category?: string;
    strain?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request<Product[]>(endpoint);
  }

  async getProductDetails(productId: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${productId}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.request<Review[]>(`/products/${productId}/reviews`);
  }

  async getReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.request<Review[]>(`/products/${productId}/reviews`);
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.request<CartItem[]>('/cart');
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.request<void>('/cart', {
      method: 'DELETE',
    });
  }

  async addToWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.request<void>('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async getWishlist(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/wishlist');
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/products/featured');
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/products/categories');
  }

  async getStrains(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/products/strains');
  }

  async verifyAge(dateOfBirth: string, state: string): Promise<ApiResponse<{ verified: boolean }>> {
    return this.request<{ verified: boolean }>('/compliance/verify-age', {
      method: 'POST',
      body: JSON.stringify({ dateOfBirth, state }),
    });
  }

  async checkStateCompliance(state: string): Promise<ApiResponse<{ allowed: boolean; restrictions?: string[] }>> {
    return this.request<{ allowed: boolean; restrictions?: string[] }>(`/compliance/state/${state}`);
  }

  async getRecommendations(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/recommendations');
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  async getOrderHistory(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/orders');
  }

  async getOrder(orderId: string): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/orders/${orderId}`);
  }

  async createOrder(orderData: unknown): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getPaymentMethods(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    available: boolean;
  }>>> {
    return this.request<Array<{
      id: string;
      name: string;
      type: string;
      available: boolean;
    }>>('/payment/methods');
  }

  async processPayment(paymentData: unknown): Promise<ApiResponse<{
    success: boolean;
    transactionId?: string;
    redirectUrl?: string;
    error?: string;
  }>> {
    return this.request<{
      success: boolean;
      transactionId?: string;
      redirectUrl?: string;
      error?: string;
    }>('/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(transactionId: string): Promise<ApiResponse<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount?: number;
    orderId?: string;
  }>> {
    return this.request<{
      status: 'pending' | 'completed' | 'failed' | 'cancelled';
      amount?: number;
      orderId?: string;
    }>(`/payment/status/${transactionId}`);
  }
}

export const api = new ApiClient();
