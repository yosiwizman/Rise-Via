export interface Product {
  id: string;
  sample_id?: string;
  name: string;
  slug?: string;
  category: string;
  strain_type?: string;
  thca_percentage?: number;
  batch_id?: string;
  volume_available?: number;
  price: number;
  prices?: {
    gram: number;
    eighth: number;
    quarter: number;
    half: number;
    ounce: number;
  };
  images: string[];
  hover_image?: string;
  video_url?: string;
  description: string;
  effects?: string[];
  flavors?: string[];
  featured?: boolean;
  inventory?: number;
  coa_document?: string;
  in_stock?: boolean;
  status?: 'active' | 'inactive' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
  // Legacy/camelCase fields for compatibility
  strainType?: string;
  thcaPercentage?: number;
  inStock?: boolean;
  active?: boolean;
  thc?: string;
  type?: string;
}

export type DBProduct = Product;

export interface InventoryLog {
  id?: string;
  product_id: string;
  change_amount: number;
  reason: string;
  previous_count: number;
  new_count: number;
  user_id?: string;
  created_at?: string;
}

export interface InventoryAlert {
  id?: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring';
  threshold: number;
  current_value: number;
  resolved: boolean;
  created_at?: string;
}
