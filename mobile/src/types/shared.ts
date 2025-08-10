
export interface Product {
  id: string;
  name: string;
  strain: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thca_percentage: number;
  cbd_percentage: number;
  price: number;
  image_url: string;
  description: string;
  effects: string[];
  flavors: string[];
  lab_results?: LabResult;
  inventory_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabResult {
  id: string;
  product_id: string;
  test_date: string;
  lab_name: string;
  batch_number: string;
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
    pesticides: 'pass' | 'fail';
    heavy_metals: 'pass' | 'fail';
    microbials: 'pass' | 'fail';
    residual_solvents: 'pass' | 'fail';
  };
  certificate_url: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  added_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth: string;
  state: string;
  is_verified: boolean;
  membership_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyalty_points: number;
  total_spent: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: Address;
  billing_address: Address;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product: Product;
  added_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'posabit' | 'aeropay' | 'hypur' | 'crypto' | 'ach';
  description: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  processing_time: string;
  is_available: boolean;
  cannabis_compliant: boolean;
}

export interface ComplianceCheck {
  age_verified: boolean;
  state_allowed: boolean;
  purchase_limits: {
    daily_limit: number;
    monthly_limit: number;
    current_usage: number;
  };
  warnings: string[];
  restrictions: string[];
}

export interface AIResponse {
  message: string;
  type: 'chat' | 'recommendation' | 'product_info' | 'compliance';
  products?: Product[];
  confidence: number;
  sources?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  membership_tier: string;
  loyalty_points: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  state?: string;
  referral_code?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface AppState {
  isAgeVerified: boolean;
  selectedState: string;
  complianceData: ComplianceCheck | null;
  setAgeVerified: (verified: boolean) => void;
  setSelectedState: (state: string) => void;
  setComplianceData: (data: ComplianceCheck) => void;
  checkCompliance: (state: string) => Promise<void>;
}

export interface StrainEffect {
  name: string;
  intensity: 'low' | 'medium' | 'high';
  description: string;
}

export interface TerpeneProfile {
  name: string;
  percentage: number;
  effects: string[];
  aroma: string;
}

export interface CannabisState {
  name: string;
  code: string;
  is_legal: boolean;
  medical_only: boolean;
  purchase_limits: {
    flower: number; // grams
    concentrates: number; // grams
    edibles: number; // mg THC
  };
  age_requirement: number;
  home_cultivation: boolean;
}
