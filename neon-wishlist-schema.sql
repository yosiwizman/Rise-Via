
CREATE TABLE IF NOT EXISTS wishlist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES wishlist_sessions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT,
  thc_content TEXT,
  cbd_content TEXT,
  effects JSONB,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  price_alert JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_sessions_token ON wishlist_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_sessions_user_id ON wishlist_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_session_id ON wishlist_items(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_category ON wishlist_items(category);

ALTER TABLE wishlist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on wishlist_sessions" ON wishlist_sessions;
DROP POLICY IF EXISTS "Allow all operations on wishlist_items" ON wishlist_items;

CREATE POLICY "Anyone can view wishlist sessions" ON wishlist_sessions 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert wishlist sessions" ON wishlist_sessions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update wishlist sessions" ON wishlist_sessions 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete wishlist sessions" ON wishlist_sessions 
  FOR DELETE USING (true);

CREATE POLICY "Anyone can view wishlist items" ON wishlist_items 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert wishlist items" ON wishlist_items 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update wishlist items" ON wishlist_items 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete wishlist items" ON wishlist_items 
  FOR DELETE USING (true);
