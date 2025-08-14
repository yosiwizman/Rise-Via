-- Complete B2B Cannabis Platform Database Schema
-- This file contains ALL tables needed for the platform

-- ============================================
-- PHASE 1: FOUNDATION TABLES
-- ============================================

-- Users table (extended for B2B)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  role VARCHAR(50) DEFAULT 'customer', -- customer, admin, employee, sales_rep, driver
  is_sales_rep BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Accounts table
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- dispensary, smoke_shop, wellness_center
  license_number VARCHAR(100),
  license_type VARCHAR(100),
  license_state VARCHAR(2),
  license_expiry DATE,
  tax_id VARCHAR(50),
  dba_name VARCHAR(255),
  
  -- Contact Information
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  
  -- Address Information
  billing_address VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(2),
  billing_zip VARCHAR(10),
  billing_country VARCHAR(2) DEFAULT 'US',
  
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(2),
  shipping_zip VARCHAR(10),
  
  -- B2B Specific
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  payment_terms VARCHAR(50) DEFAULT 'NET30', -- NET30, NET60, COD, PREPAID
  credit_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, suspended, rejected
  account_status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  
  -- Sales Assignment
  territory_id UUID,
  assigned_rep_id UUID REFERENCES users(id),
  sales_rep_id UUID REFERENCES users(id),
  rep_assigned_at TIMESTAMP,
  rep_assignment_method VARCHAR(50), -- registration, admin, territory, qr_code, referral
  rep_code_used VARCHAR(50),
  referral_source VARCHAR(255),
  
  -- Metrics
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  last_order_date TIMESTAMP,
  order_count INTEGER DEFAULT 0,
  
  -- Compliance
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  compliance_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Users (multi-user support for business accounts)
CREATE TABLE IF NOT EXISTS business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_account_id UUID REFERENCES business_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- owner, buyer, accountant, viewer
  permissions JSONB,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_account_id, user_id)
);

-- Sales Reps table
CREATE TABLE IF NOT EXISTS sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  rep_code VARCHAR(50) UNIQUE NOT NULL,
  employee_id VARCHAR(100),
  hire_date DATE,
  
  -- Commission Structure
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  commission_tier VARCHAR(50) DEFAULT 'standard', -- standard, silver, gold, platinum
  override_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Territory Management
  territory_ids UUID[],
  can_sell_outside_territory BOOLEAN DEFAULT FALSE,
  
  -- Management
  manager_id UUID REFERENCES sales_reps(id),
  is_manager BOOLEAN DEFAULT FALSE,
  team_name VARCHAR(100),
  
  -- Quotas
  monthly_quota DECIMAL(10, 2),
  quarterly_quota DECIMAL(10, 2),
  annual_quota DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, terminated
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission Transactions table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID REFERENCES sales_reps(id),
  order_id UUID,
  business_account_id UUID REFERENCES business_accounts(id),
  type VARCHAR(50) NOT NULL, -- sale, bonus, override, adjustment, clawback
  description TEXT,
  order_amount DECIMAL(10, 2),
  commissionable_amount DECIMAL(10, 2),
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid, cancelled
  sale_date DATE,
  commission_period VARCHAR(7), -- YYYY-MM format
  paid_date DATE,
  payment_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 3: TERRITORY TABLES
-- ============================================

-- Territories table
CREATE TABLE IF NOT EXISTS territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  zip_codes TEXT[] NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2) NOT NULL,
  assigned_rep_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'available', -- available, assigned, protected, house
  protection_type VARCHAR(50) DEFAULT 'none', -- first-to-sign, performance-based, time-limited, none
  protection_start_date TIMESTAMP,
  protection_end_date TIMESTAMP,
  boundaries JSONB, -- GeoJSON polygon data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Territory Assignments table
CREATE TABLE IF NOT EXISTS territory_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  rep_id UUID REFERENCES users(id),
  assigned_date TIMESTAMP NOT NULL,
  assigned_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active', -- active, pending, expired, transferred
  protection_level VARCHAR(50) DEFAULT 'full', -- full, partial, none
  commission_override DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Territory Protection Rules table
CREATE TABLE IF NOT EXISTS territory_protection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id) UNIQUE,
  rule_type VARCHAR(50) NOT NULL, -- lifetime, performance, time-based, hybrid
  conditions JSONB,
  inheritance_rules JSONB,
  split_commission_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Territory Transfer History table
CREATE TABLE IF NOT EXISTS territory_transfer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  from_rep_id UUID REFERENCES users(id),
  to_rep_id UUID REFERENCES users(id),
  transfer_date TIMESTAMP NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Territory Conflicts table
CREATE TABLE IF NOT EXISTS territory_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  conflicting_rep_id UUID REFERENCES users(id),
  current_rep_id UUID REFERENCES users(id),
  conflict_type VARCHAR(50), -- overlap, dispute, transfer_request
  details TEXT,
  resolution_status VARCHAR(50) DEFAULT 'pending', -- pending, resolved, escalated
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rep Account History table
CREATE TABLE IF NOT EXISTS rep_account_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_account_id UUID REFERENCES business_accounts(id),
  rep_id UUID REFERENCES users(id),
  action VARCHAR(50), -- assigned, transferred, removed
  reason TEXT,
  previous_rep_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDERS & PRODUCTS TABLES (Referenced by services)
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  strain_type VARCHAR(50),
  thc_content DECIMAL(5, 2),
  cbd_content DECIMAL(5, 2),
  description TEXT,
  price DECIMAL(10, 2),
  wholesale_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  compliance_status VARCHAR(50),
  batch_number VARCHAR(100),
  test_results JSONB,
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  business_account_id UUID REFERENCES business_accounts(id),
  sales_rep_id UUID REFERENCES users(id),
  
  -- Order Details
  status VARCHAR(50) DEFAULT 'pending',
  order_type VARCHAR(50) DEFAULT 'standard', -- standard, wholesale, sample
  
  -- Amounts
  subtotal DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  shipping_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_terms VARCHAR(50),
  due_date DATE,
  paid_date TIMESTAMP,
  
  -- Delivery
  delivery_date DATE,
  delivery_window_start TIME,
  delivery_window_end TIME,
  delivery_instructions TEXT,
  
  -- Tracking
  manifest_number VARCHAR(100),
  tracking_number VARCHAR(100),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 4: ADDITIONAL TRACKING TABLES
-- ============================================

-- Geofence Alerts table
CREATE TABLE IF NOT EXISTS geofence_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES geofence_zones(id),
  zone_name VARCHAR(200),
  zone_type VARCHAR(50),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50), -- enter, exit, dwell, speed_violation
  timestamp TIMESTAMP NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  duration INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Geofence Events table
CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  zone_id UUID REFERENCES geofence_zones(id),
  event_type VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Violations table
CREATE TABLE IF NOT EXISTS compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  zone_id UUID REFERENCES geofence_zones(id),
  violation_type VARCHAR(100),
  violation_details JSONB,
  severity VARCHAR(50), -- low, medium, high, critical
  timestamp TIMESTAMP NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings table (for API keys, etc.)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create all necessary indexes
CREATE INDEX idx_business_accounts_rep ON business_accounts(assigned_rep_id);
CREATE INDEX idx_business_accounts_territory ON business_accounts(territory_id);
CREATE INDEX idx_commission_transactions_rep ON commission_transactions(rep_id);
CREATE INDEX idx_commission_transactions_period ON commission_transactions(commission_period);
CREATE INDEX idx_territories_state ON territories(state);
CREATE INDEX idx_territories_rep ON territories(assigned_rep_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_business ON orders(business_account_id);
CREATE INDEX idx_orders_rep ON orders(sales_rep_id);
