export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  thca_percentage: number;
  inventory_count: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: Date;
  updated_at: Date;
}

export interface ComplianceEvent {
  id: string;
  event_type: 'age_verification' | 'terms_accepted' | 'coa_viewed' | 'restricted_access';
  user_id: string;
  session_id: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  status: string;
  total: number;
  created_at: Date;
}

export interface LabResult {
  id: string;
  product_id: string;
  test_type: string;
  results: Record<string, unknown>;
  expiration_date: string;
  qr_code: string;
  created_at: Date;
}
