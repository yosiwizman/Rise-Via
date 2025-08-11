import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || import.meta.env.VITE_NEON_DATABASE_URL;
const isValidDatabaseUrl = DATABASE_URL && typeof DATABASE_URL === 'string' && DATABASE_URL.startsWith('postgresql://');

if (!isValidDatabaseUrl) {
  console.warn('⚠️ No valid database URL provided in database.ts. Running in development mode with mock data.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any = null;
try {
  sql = isValidDatabaseUrl ? neon(DATABASE_URL) : null;
} catch (error) {
  console.error('❌ Failed to initialize Neon database connection in database.ts:', error);
  sql = null;
}

export async function testConnection() {
  if (!sql) {
    console.warn('⚠️ Database not available, skipping connection test');
    return false;
  }
  
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Neon Database connected:', result);
    return true;
  } catch (error) {
    console.error('Neon Database connection failed:', error);
    return false;
  }
}

// Create required tables if they don't exist
export async function initializeTables() {
  if (!sql) {
    console.warn('⚠️ Database not available, skipping table initialization');
    return false;
  }
  
  try {
    // Products table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        thc_percentage DECIMAL(5,2),
        cbd_percentage DECIMAL(5,2),
        inventory INTEGER DEFAULT 0,
        description TEXT,
        effects TEXT[],
        active BOOLEAN DEFAULT true,
        images TEXT[],
        strain_type VARCHAR(50),
        terpenes TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Users table  
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customers table (for legacy compatibility)
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customer profiles table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        membership_tier VARCHAR(50) DEFAULT 'GREEN',
        loyalty_points INTEGER DEFAULT 0,
        preferences JSONB DEFAULT '{}',
        is_b2b BOOLEAN DEFAULT false,
        business_name VARCHAR(255),
        business_license VARCHAR(100),
        segment VARCHAR(50),
        lifetime_value DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        referral_code VARCHAR(50),
        total_referrals INTEGER DEFAULT 0,
        last_order_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Wishlist sessions table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Wishlist items table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES wishlist_sessions(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100),
        thc_content VARCHAR(50),
        cbd_content VARCHAR(50),
        effects TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        price_alert TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Orders table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id),
        customer_id UUID REFERENCES customers(id),
        total DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        shipping_address JSONB,
        billing_address JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Order items table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Cart items table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255),
        product_id VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Loyalty transactions table
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        points INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Activity logs table (for admin dashboard)
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        target_price DECIMAL(10,2) NOT NULL,
        current_price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        triggered_at TIMESTAMP,
        notification_sent BOOLEAN DEFAULT false
      )
    `;

    // Create indexes for better performance
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`;
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_items_session_id ON wishlist_items(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_customer_id ON price_alerts(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id)`;

    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_name VARCHAR(255) DEFAULT 'Rise-Via Team',
        keywords TEXT[] DEFAULT '{}',
        tone VARCHAR(50) DEFAULT 'educational',
        target_length INTEGER DEFAULT 500,
        status VARCHAR(20) DEFAULT 'draft',
        published_at TIMESTAMP,
        scheduled_at TIMESTAMP,
        view_count INTEGER DEFAULT 0,
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_name VARCHAR(255) DEFAULT 'Rise-Via Team',
        keywords JSONB DEFAULT '[]',
        tone VARCHAR(50) DEFAULT 'educational',
        target_length INTEGER DEFAULT 500,
        status VARCHAR(20) DEFAULT 'draft',
        published_at TIMESTAMP,
        scheduled_at TIMESTAMP,
        view_count INTEGER DEFAULT 0,
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for blog posts
    if (!sql) {
      console.warn('⚠️ Database connection lost during initialization');
      return false;
    }
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_at ON blog_posts(scheduled_at)`;

    console.log('All tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Table initialization failed:', error);
    return false;
  }
}

// Helper function for password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Export the sql instance for direct queries
export { sql };
