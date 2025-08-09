CREATE TABLE IF NOT EXISTS compliance_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES customers(id),
  session_id VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  risk_score DECIMAL(3,2) NOT NULL,
  compliance_result BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES customers(id),
  session_id VARCHAR(255),
  daily_amount DECIMAL(10,2) DEFAULT 0,
  monthly_amount DECIMAL(10,2) DEFAULT 0,
  last_purchase_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  batch_id VARCHAR(255) NOT NULL UNIQUE,
  test_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  thca_percentage DECIMAL(5,2),
  delta9_thc_percentage DECIMAL(5,2),
  cbd_percentage DECIMAL(5,2),
  pesticides_passed BOOLEAN DEFAULT false,
  heavy_metals_passed BOOLEAN DEFAULT false,
  microbials_passed BOOLEAN DEFAULT false,
  terpene_profile JSONB,
  coa_url TEXT,
  qr_code TEXT,
  lab_name VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_events_type ON compliance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_events_session ON compliance_events(session_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_created_at ON compliance_events(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_limits_user_id ON purchase_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_limits_session_id ON purchase_limits(session_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_batch_id ON lab_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_product_id ON lab_results(product_id);

ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read compliance_events" ON compliance_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read purchase_limits" ON purchase_limits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read lab_results" ON lab_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access compliance_events" ON compliance_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access purchase_limits" ON purchase_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access lab_results" ON lab_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous insert compliance_events" ON compliance_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert purchase_limits" ON purchase_limits
  FOR INSERT TO anon WITH CHECK (true);
