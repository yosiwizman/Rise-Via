CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  strain_type VARCHAR(50) NOT NULL,
  thca_percentage DECIMAL(5,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  hover_image TEXT,
  video_url TEXT,
  description TEXT,
  effects TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  inventory INTEGER DEFAULT 0,
  coa_document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_strain_type ON products(strain_type);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON products 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON products 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON products 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON products 
    FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO products (name, slug, category, strain_type, thca_percentage, price, images, description, effects, featured, inventory) VALUES
('Blue Dream', 'blue-dream', 'flower', 'hybrid', 27.8, 45.00, ARRAY['https://example.com/blue-dream-1.jpg', 'https://example.com/blue-dream-2.jpg'], 'A balanced hybrid strain known for its cerebral high and full-body relaxation.', ARRAY['Creative', 'Energetic', 'Relaxed'], true, 150),
('OG Kush', 'og-kush', 'flower', 'indica', 24.5, 52.00, ARRAY['https://example.com/og-kush-1.jpg'], 'Classic indica strain with earthy and pine flavors.', ARRAY['Relaxed', 'Sleepy', 'Happy'], false, 75),
('Sour Diesel', 'sour-diesel', 'flower', 'sativa', 26.2, 48.00, ARRAY['https://example.com/sour-diesel-1.jpg'], 'Energizing sativa with a pungent diesel aroma.', ARRAY['Energetic', 'Creative', 'Uplifted'], true, 120)
ON CONFLICT (slug) DO NOTHING;
