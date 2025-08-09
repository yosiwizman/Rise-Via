import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder';

const sql = neon(databaseUrl);

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

<<<<<<< HEAD
export interface WishlistSession {
  id: string;
  session_token: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
||||||| parent of dfc84dc (feat: implement AI assistant with Flowise and LangChain integration)

const neonConnectionString = import.meta.env?.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('Missing Neon database URL - check VITE_NEON_DATABASE_URL environment variable');
  throw new Error('Missing required Neon database URL');
=======

const neonConnectionString = import.meta.env?.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.warn('Missing Neon database URL - check VITE_NEON_DATABASE_URL environment variable. Database features will be disabled.');
>>>>>>> dfc84dc (feat: implement AI assistant with Flowise and LangChain integration)
}

<<<<<<< HEAD
export interface WishlistItem {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
||||||| parent of dfc84dc (feat: implement AI assistant with Flowise and LangChain integration)
export const neonClient = neon(neonConnectionString);

export async function executeQuery(sql: string, params: (string | number | null | undefined)[] = []) {
  try {
    const result = await neonClient(sql, params);
    return { data: result, error: null };
  } catch (error) {
    console.error('Neon query error:', error);
    return { data: null, error };
  }
=======
export const neonClient = neonConnectionString ? neon(neonConnectionString) : null;

export async function executeQuery(sql: string, params: (string | number | null | undefined)[] = []) {
  if (!neonClient) {
    console.warn('Neon database not configured - returning empty result');
    return { data: [], error: new Error('Database not configured') };
  }
  
  try {
    const result = await neonClient(sql, params);
    return { data: result, error: null };
  } catch (error) {
    console.error('Neon query error:', error);
    return { data: null, error };
  }
>>>>>>> dfc84dc (feat: implement AI assistant with Flowise and LangChain integration)
}
