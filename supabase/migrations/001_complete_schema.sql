
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_desc TEXT,
  
  strain VARCHAR(50) NOT NULL DEFAULT 'hybrid',
  strain_type VARCHAR(100),
  grow_type VARCHAR(50),
  
  thc DECIMAL(5,2),
  thca DECIMAL(5,2),
  cbd DECIMAL(5,2),
  cbg DECIMAL(5,2),
  total_cannabinoids DECIMAL(5,2),
  
  thumbnail TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  video_360_url TEXT,
  
  base_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  
  in_stock BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 10,
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  category VARCHAR(100) DEFAULT 'flower',
  price DECIMAL(10,2) NOT NULL,
  thca_percentage DECIMAL(5,2),
  effects TEXT[] DEFAULT '{}',
  terpenes TEXT[] DEFAULT '{}',
  inventory_count INTEGER DEFAULT 100,
  status VARCHAR(50) DEFAULT 'active',
  lab_results_url TEXT,
  coa_url TEXT,
  batch_number VARCHAR(100),
  harvest_date DATE
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  date_of_birth DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  id_photo_url TEXT,
  
  medical_id VARCHAR(100),
  medical_expiry DATE,
  
  favorite_strains TEXT[] DEFAULT '{}',
  preferred_effects TEXT[] DEFAULT '{}',
  avoid_effects TEXT[] DEFAULT '{}',
  
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  
  loyalty_points INTEGER DEFAULT 0,
  vip_tier VARCHAR(20),
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_order_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id),
  UNIQUE(session_id)
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cart_id, product_id)
);

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id),
  UNIQUE(session_id)
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(wishlist_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  
  customer_id UUID REFERENCES customers(id),
  
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  fulfillment_type VARCHAR(50) DEFAULT 'pickup',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  delivery_address_id UUID,
  driver_id VARCHAR(100),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  age_verified BOOLEAN DEFAULT false,
  id_checked BOOLEAN DEFAULT false,
  signature TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  variant_info JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  
  effects_rating INTEGER CHECK (effects_rating >= 1 AND effects_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  images TEXT[] DEFAULT '{}',
  
  verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, customer_id)
);

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  
  batch_number VARCHAR(100) UNIQUE NOT NULL,
  metrc_id VARCHAR(100),
  harvest_date DATE NOT NULL,
  package_date DATE NOT NULL,
  expiration_date DATE,
  
  quantity INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) UNIQUE,
  
  lab_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  coi_url TEXT NOT NULL,
  
  thc DECIMAL(5,2),
  thca DECIMAL(5,2),
  cbd DECIMAL(5,2),
  cbg DECIMAL(5,2),
  
  pesticides BOOLEAN DEFAULT false,
  heavy_metals BOOLEAN DEFAULT false,
  microbials BOOLEAN DEFAULT false,
  mycotoxins BOOLEAN DEFAULT false,
  
  passed BOOLEAN NOT NULL,
  results JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT '{}',
  
  last_login TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_strain ON products(strain);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO categories (name, slug, description) VALUES
('Flower', 'flower', 'Premium cannabis flower products'),
('Pre-Rolls', 'pre-rolls', 'Ready-to-smoke pre-rolled joints'),
('Edibles', 'edibles', 'Cannabis-infused edible products'),
('Concentrates', 'concentrates', 'High-potency cannabis concentrates'),
('Accessories', 'accessories', 'Cannabis accessories and supplies');

INSERT INTO admins (email, password, name, role) VALUES
('admin@risevia.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'super_admin');

INSERT INTO settings (key, value, category) VALUES
('site_name', '"RiseViA"', 'general'),
('tax_rate', '0.08', 'tax'),
('delivery_fee', '10.00', 'delivery'),
('min_order_amount', '25.00', 'general');
