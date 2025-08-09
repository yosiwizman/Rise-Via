// import { neon } from '@neondatabase/serverless';

// const sql = neon(import.meta.env.VITE_DATABASE_URL || 'postgresql://placeholder');

const sql = async (query: any, ...params: any[]) => {
  console.log('Mock SQL query:', query, params);
  if (typeof query === 'string' || (query && query.raw)) {
    const queryStr = typeof query === 'string' ? query : query.raw.join('');
    if (queryStr.includes('SELECT') && queryStr.includes('users')) {
      return [{ id: '1', email: 'test@example.com', password_hash: 'test', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    }
    if (queryStr.includes('SELECT') && queryStr.includes('customers')) {
      return [{ id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User', phone: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    }
    if (queryStr.includes('INSERT') && queryStr.includes('users')) {
      return [{ id: '1', email: 'test@example.com', password_hash: 'test', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    }
    if (queryStr.includes('INSERT') && queryStr.includes('customers')) {
      return [{ id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User', phone: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    }
    if (queryStr.includes('INSERT')) {
      return [{ id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    }
  }
  return [];
};

export { sql };

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  customer_id: string;
  membership_tier: string;
  loyalty_points: number;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

export interface WishlistSession {
  id: string;
  session_token: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
}
