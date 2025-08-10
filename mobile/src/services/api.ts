
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173/api' 
  : 'https://rise-via.vercel.app/api';

export class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<any> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<any> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async getMe(): Promise<any> {
    return this.request('/auth/me');
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    strain?: string;
    type?: string;
    search?: string;
  }) {
    const queryString = params 
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request('/products/featured');
  }

  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  async chatWithAI(message: string, context?: any) {
    return this.request('/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getStrainRecommendations(preferences: any) {
    return this.request('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async verifyAge(dateOfBirth: string) {
    return this.request('/compliance/verify-age', {
      method: 'POST',
      body: JSON.stringify({ dateOfBirth }),
    });
  }

  async checkStateCompliance(state: string) {
    return this.request(`/compliance/state/${state}`);
  }

  async getPurchaseLimits(customerId: string) {
    return this.request(`/compliance/limits/${customerId}`);
  }

  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async processPayment(paymentData: any) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(transactionId: string) {
    return this.request(`/payments/status/${transactionId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export const api = {
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (userData: any) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  
  getProducts: (params?: any) => apiClient.getProducts(params),
  getProduct: (id: string) => apiClient.getProduct(id),
  getFeaturedProducts: () => apiClient.getFeaturedProducts(),
  
  getCart: () => apiClient.getCart(),
  addToCart: (productId: string, quantity: number) => 
    apiClient.addToCart(productId, quantity),
  updateCartItem: (productId: string, quantity: number) => 
    apiClient.updateCartItem(productId, quantity),
  removeFromCart: (productId: string) => apiClient.removeFromCart(productId),
  clearCart: () => apiClient.clearCart(),
  
  getOrders: () => apiClient.getOrders(),
  getOrder: (id: string) => apiClient.getOrder(id),
  createOrder: (orderData: any) => apiClient.createOrder(orderData),
  
  getWishlist: () => apiClient.getWishlist(),
  addToWishlist: (productId: string) => apiClient.addToWishlist(productId),
  removeFromWishlist: (productId: string) => apiClient.removeFromWishlist(productId),
  
  chatWithAI: (message: string, context?: any) => 
    apiClient.chatWithAI(message, context),
  getStrainRecommendations: (preferences: any) => 
    apiClient.getStrainRecommendations(preferences),
  
  verifyAge: (dateOfBirth: string) => apiClient.verifyAge(dateOfBirth),
  checkStateCompliance: (state: string) => apiClient.checkStateCompliance(state),
  getPurchaseLimits: (customerId: string) => apiClient.getPurchaseLimits(customerId),
  
  getPaymentMethods: () => apiClient.getPaymentMethods(),
  processPayment: (paymentData: any) => apiClient.processPayment(paymentData),
  getPaymentStatus: (transactionId: string) => 
    apiClient.getPaymentStatus(transactionId),
};
