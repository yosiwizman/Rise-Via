DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS wishlist_sessions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  age_verified BOOLEAN DEFAULT FALSE,
  state VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  inventory_count INTEGER DEFAULT 100,
  category VARCHAR(100),
  strain_type VARCHAR(50),
  thca_percentage DECIMAL(5,2),
  thc_percentage DECIMAL(5,2),
  cbd_percentage DECIMAL(5,2),
  images JSONB DEFAULT '[]',
  effects JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_items (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES wishlist_sessions(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, product_id)
);

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  template_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_wishlist_session ON wishlist_sessions(session_token);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

INSERT INTO products (name, slug, description, price, category, strain_type, thca_percentage, images, effects, inventory_count) VALUES
('Blue Dream', 'blue-dream', 'Premium sativa-dominant hybrid strain known for its balanced effects and sweet berry aroma', 45.00, 'Flower', 'Sativa', 24.8, '["https://images.unsplash.com/photo-1536924940846-227afb31e2a5"]', '["Euphoric", "Creative", "Relaxed"]', 25),
('OG Kush', 'og-kush', 'Classic indica strain with earthy flavors and potent relaxing effects', 52.00, 'Flower', 'Indica', 26.2, '["https://images.unsplash.com/photo-1548181048-7cfea6f4c14d"]', '["Relaxed", "Happy", "Sleepy"]', 18),
('Sour Diesel', 'sour-diesel', 'Energizing sativa with diesel aroma and uplifting cerebral effects', 48.00, 'Flower', 'Sativa', 22.5, '["https://images.unsplash.com/photo-1574781330711-9d21cd7c441f"]', '["Energetic", "Uplifted", "Creative"]', 30),
('Granddaddy Purple', 'granddaddy-purple', 'Purple indica strain with grape and berry flavors', 49.00, 'Flower', 'Indica', 25.1, '["https://images.unsplash.com/photo-1605467829842-2c5b61b9a3a6"]', '["Relaxed", "Sleepy", "Happy"]', 22),
('Green Crack', 'green-crack', 'Energetic sativa strain perfect for daytime use', 46.00, 'Flower', 'Sativa', 21.7, '["https://images.unsplash.com/photo-1617295124386-e6f8e29e1b95"]', '["Energetic", "Focused", "Uplifted"]', 35),
('Purple Haze', 'purple-haze', 'Legendary sativa strain with psychedelic effects', 51.00, 'Flower', 'Sativa', 23.4, '["https://images.unsplash.com/photo-1584482356330-0fb5e2d09de2"]', '["Euphoric", "Creative", "Uplifted"]', 28),
('Northern Lights', 'northern-lights', 'Pure indica strain famous for its resinous buds', 47.00, 'Flower', 'Indica', 27.1, '["https://images.unsplash.com/photo-1574781330711-9d21cd7c441f"]', '["Relaxed", "Sleepy", "Euphoric"]', 20),
('Jack Herer', 'jack-herer', 'Sativa-dominant strain with spicy pine scent', 50.00, 'Flower', 'Sativa', 24.2, '["https://images.unsplash.com/photo-1536924940846-227afb31e2a5"]', '["Creative", "Energetic", "Happy"]', 32),
('White Widow', 'white-widow', 'Balanced hybrid covered in white crystal resin', 48.50, 'Flower', 'Hybrid', 25.8, '["https://images.unsplash.com/photo-1548181048-7cfea6f4c14d"]', '["Balanced", "Happy", "Relaxed"]', 26),
('Pineapple Express', 'pineapple-express', 'Hybrid strain with tropical flavors', 46.50, 'Flower', 'Hybrid', 22.9, '["https://images.unsplash.com/photo-1574781330711-9d21cd7c441f"]', '["Happy", "Energetic", "Creative"]', 24),
('Gelato', 'gelato', 'Sweet dessert strain with balanced effects', 53.00, 'Flower', 'Hybrid', 26.7, '["https://images.unsplash.com/photo-1605467829842-2c5b61b9a3a6"]', '["Relaxed", "Happy", "Euphoric"]', 19),
('Zkittlez', 'zkittlez', 'Fruity indica-dominant strain', 49.50, 'Flower', 'Indica', 24.6, '["https://images.unsplash.com/photo-1617295124386-e6f8e29e1b95"]', '["Relaxed", "Happy", "Calming"]', 21),
('Wedding Cake', 'wedding-cake', 'Rich and tangy hybrid strain', 54.00, 'Flower', 'Hybrid', 28.3, '["https://images.unsplash.com/photo-1584482356330-0fb5e2d09de2"]', '["Relaxed", "Euphoric", "Happy"]', 16),
('Trainwreck', 'trainwreck', 'Sativa-dominant strain with lemony scent', 47.50, 'Flower', 'Sativa', 23.1, '["https://images.unsplash.com/photo-1574781330711-9d21cd7c441f"]', '["Euphoric", "Creative", "Happy"]', 29),
('Bubba Kush', 'bubba-kush', 'Heavy indica strain for deep relaxation', 51.50, 'Flower', 'Indica', 27.8, '["https://images.unsplash.com/photo-1536924940846-227afb31e2a5"]', '["Relaxed", "Sleepy", "Hungry"]', 17);

SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
