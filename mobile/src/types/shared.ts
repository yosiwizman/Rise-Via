export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  membership_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyalty_points: number;
  is_verified: boolean;
  preferences: {
    newsletter: boolean;
    sms_notifications: boolean;
    product_recommendations: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  strain: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thca_percentage: number;
  cbd_percentage?: number;
  effects: string[];
  flavors: string[];
  inventory_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  inventory_count: number;
  lab_results: LabResult[];
  created_at: string;
  updated_at: string;
}

export interface LabResult {
  id: string;
  product_id: string;
  batch_number: string;
  test_date: string;
  lab_name: string;
  cannabinoids: {
    thca: number;
    thc: number;
    cbd: number;
    cbg: number;
    cbn: number;
  };
  terpenes: {
    name: string;
    percentage: number;
  }[];
  contaminants: {
    pesticides: boolean;
    heavy_metals: boolean;
    microbials: boolean;
    residual_solvents: boolean;
  };
  potency_verified: boolean;
  safety_verified: boolean;
  certificate_url: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  added_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  verified_purchase: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  date_of_birth: string;
}

export interface CartState {
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

export interface AuthState {
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

export interface StateCompliance {
  state: string;
  is_legal: boolean;
  medical_only: boolean;
  recreational_legal: boolean;
  possession_limit: string;
  purchase_limit: string;
  age_requirement: number;
  home_cultivation: boolean;
}

export interface AgeVerification {
  is_verified: boolean;
  verification_date: string;
  state: string;
}
