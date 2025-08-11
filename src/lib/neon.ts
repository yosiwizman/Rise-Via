import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

const isValidDatabaseUrl = DATABASE_URL && typeof DATABASE_URL === 'string' && DATABASE_URL.startsWith('postgresql://');

if (!isValidDatabaseUrl) {
  console.warn('⚠️ No valid database URL provided. Running in development mode with mock data.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any = null;
try {
  sql = isValidDatabaseUrl ? neon(DATABASE_URL!) : null;
} catch (error) {
  console.error('❌ Failed to initialize Neon database connection in neon.ts:', error);
  sql = null;
}

export { sql };

export async function query(text: string, params: (string | number | boolean | Date | null | undefined)[] = []) {
  if (!sql) {
    console.warn('⚠️ Database not available, returning mock data for query:', (text && typeof text === 'string') ? text.substring(0, 60) + '...' : 'undefined query');
    return { rows: [], error: null };
  }
  
  try {
    console.log('🔵 Executing Neon query:', (text && typeof text === 'string') ? text.substring(0, 60) + '...' : 'undefined query');
    const startTime = Date.now();
    
    const result = await sql(text, params);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Query successful in ${duration}ms, rows:`, Array.isArray(result) ? result.length : 'single result');
    
    return { rows: result, error: null };
  } catch (error) {
    console.error('❌ Neon database query error:', error);
    return { rows: [], error };
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const authDb = {
  async createUser(email: string, password: string, firstName?: string, lastName?: string) {
    console.log('🔵 Creating user:', email);
    const passwordHash = await hashPassword(password);
    const { rows, error } = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
      [email, passwordHash, firstName, lastName]
    );
    
    if (error) {
      console.error('❌ User creation failed:', error);
      return null;
    }
    
    console.log('✅ User created successfully:', rows[0]?.email);
    return rows[0];
  },

  async loginUser(email: string, password: string) {
    console.log('🔵 Authenticating user:', email);
    const passwordHash = await hashPassword(password);
    const { rows, error } = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );
    
    if (error || rows.length === 0) {
      console.error('❌ Authentication failed for:', email);
      return null;
    }
    
    console.log('✅ User authenticated successfully:', email);
    return rows[0];
  },

  async createSession(userId: number) {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const { error } = await query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [userId, sessionToken, expiresAt]
    );
    
    if (error) {
      console.error('❌ Session creation failed:', error);
      return null;
    }
    
    console.log('✅ Session created for user ID:', userId);
    return sessionToken;
  },

  async validateSession(sessionToken: string) {
    const { rows, error } = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name 
       FROM users u 
       JOIN user_sessions s ON u.id = s.user_id 
       WHERE s.session_token = $1 AND s.expires_at > NOW()`,
      [sessionToken]
    );
    
    if (error || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  },

  async destroySession(sessionToken: string) {
    await query('DELETE FROM user_sessions WHERE session_token = $1', [sessionToken]);
    console.log('✅ Session destroyed');
  }
};

export const wishlistDb = {
  async getOrCreateSession(token: string) {
    console.log('🔵 Getting/creating wishlist session:', (token && typeof token === 'string') ? token.substring(0, 10) + '...' : 'undefined token');
    
    const { rows: existing } = await query(
      'SELECT * FROM wishlist_sessions WHERE session_token = $1',
      [token]
    );
    
    if (existing.length > 0) {
      console.log('✅ Found existing wishlist session:', existing[0].id);
      return existing[0];
    }
    
    const { rows: newSession } = await query(
      'INSERT INTO wishlist_sessions (session_token) VALUES ($1) RETURNING *',
      [token]
    );
    
    console.log('✅ Created new wishlist session:', newSession[0]?.id);
    return newSession[0];
  },

  async getItems(sessionToken: string) {
    console.log('🔵 Getting wishlist items for session:', (sessionToken && typeof sessionToken === 'string') ? sessionToken.substring(0, 10) + '...' : 'undefined token');
    const session = await this.getOrCreateSession(sessionToken);
    if (!session) return [];
    
    const { rows } = await query(
      'SELECT product_id FROM wishlist_items WHERE session_id = $1',
      [session.id]
    );
    
    const productIds = rows.map((row: Record<string, unknown>) => row.product_id);
    console.log('✅ Found wishlist items:', productIds);
    return productIds;
  },

  async addItem(sessionToken: string, productId: string) {
    console.log('🔵 Adding item to wishlist database:', productId);
    const session = await this.getOrCreateSession(sessionToken);
    if (!session) return false;
    
    const { error } = await query(
      'INSERT INTO wishlist_items (session_id, product_id) VALUES ($1, $2) ON CONFLICT (session_id, product_id) DO NOTHING',
      [session.id, productId]
    );
    
    if (!error) {
      console.log('✅ Item successfully added to wishlist database:', productId);
      return true;
    } else {
      console.error('❌ Failed to add item to wishlist database:', error);
      return false;
    }
  },

  async removeItem(sessionToken: string, productId: string) {
    console.log('🔵 Removing item from wishlist database:', productId);
    const session = await this.getOrCreateSession(sessionToken);
    if (!session) return false;
    
    const { error } = await query(
      'DELETE FROM wishlist_items WHERE session_id = $1 AND product_id = $2',
      [session.id, productId]
    );
    
    if (!error) {
      console.log('✅ Item successfully removed from wishlist database:', productId);
      return true;
    } else {
      console.error('❌ Failed to remove item from wishlist database:', error);
      return false;
    }
  },

  async clearItems(sessionToken: string) {
    console.log('🔵 Clearing all wishlist items from database');
    const session = await this.getOrCreateSession(sessionToken);
    if (!session) return false;
    
    const { error } = await query(
      'DELETE FROM wishlist_items WHERE session_id = $1',
      [session.id]
    );
    
    if (!error) {
      console.log('✅ All wishlist items cleared from database');
      return true;
    } else {
      console.error('❌ Failed to clear wishlist items from database:', error);
      return false;
    }
  }
};

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
  preferences: Record<string, unknown>;
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
