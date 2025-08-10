export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  membership_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyalty_points?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  strain: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thca_percentage: number;
  price: number;
  image_url?: string;
  images?: string[];
  description?: string;
  category?: string;
  brand?: string;
  effects?: string[];
  popularity?: number;
  inventory_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  inventory_count?: number;
  restock_date?: string;
  lab_results?: LabResult[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  added_at: string;
}

export interface LabResult {
  id: string;
  product_id: string;
  test_type: string;
  result_value: number;
  unit: string;
  tested_at: string;
  lab_name: string;
  certificate_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ComplianceData {
  age_verified: boolean;
  state: string;
  verification_date: string;
}
