-- Admin Users Table (created first as it's referenced by other tables)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales Representatives Table
CREATE TABLE IF NOT EXISTS sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Links to main users table if exists
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  mobile VARCHAR(20),
  
  -- Rep Details
  rep_code VARCHAR(20) UNIQUE NOT NULL,
  employee_id VARCHAR(50),
  hire_date DATE,
  
  -- Commission Structure
  commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- Base commission percentage
  commission_tier VARCHAR(20) DEFAULT 'standard', -- 'standard', 'silver', 'gold', 'platinum'
  override_rate DECIMAL(5, 2) DEFAULT 0, -- For sales managers
  
  -- Territory Assignment
  territory_ids UUID[],
  can_sell_outside_territory BOOLEAN DEFAULT FALSE,
  
  -- Hierarchy
  manager_id UUID,
  is_manager BOOLEAN DEFAULT FALSE,
  team_name VARCHAR(100),
  
  -- Performance Metrics
  monthly_quota DECIMAL(10, 2),
  quarterly_quota DECIMAL(10, 2),
  annual_quota DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'terminated'
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at TIMESTAMP,
  termination_date DATE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add the self-referencing foreign key constraint after the table is created
ALTER TABLE sales_reps 
  ADD CONSTRAINT fk_manager 
  FOREIGN KEY (manager_id) 
  REFERENCES sales_reps(id) 
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- Business Accounts Table
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  dba_name VARCHAR(255),
  business_type VARCHAR(50) NOT NULL, -- 'smoke_shop', 'dispensary', 'distributor', 'chain'
  tax_id VARCHAR(50),
  license_number VARCHAR(100),
  license_type VARCHAR(50),
  license_state VARCHAR(2),
  license_expiry DATE,
  license_verified BOOLEAN DEFAULT FALSE,
  license_verified_at TIMESTAMP,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  
  -- Address Information
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(2),
  billing_zip VARCHAR(10),
  billing_country VARCHAR(2) DEFAULT 'US',
  
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(2),
  shipping_zip VARCHAR(10),
  shipping_country VARCHAR(2) DEFAULT 'US',
  shipping_same_as_billing BOOLEAN DEFAULT TRUE,
  
  -- Credit & Payment Terms
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  credit_used DECIMAL(10, 2) DEFAULT 0,
  payment_terms VARCHAR(20) DEFAULT 'NET30', -- 'COD', 'NET15', 'NET30', 'NET60'
  credit_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'hold'
  credit_approved_at TIMESTAMP,
  credit_approved_by UUID,
  
  -- Sales Rep Assignment
  assigned_rep_id UUID,
  rep_assigned_at TIMESTAMP,
  rep_assignment_method VARCHAR(50), -- 'registration', 'admin', 'territory', 'qr_code', 'referral', 'trade_show'
  rep_code_used VARCHAR(20),
  referral_source VARCHAR(255),
  
  -- Account Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'inactive'
  approved_at TIMESTAMP,
  approved_by UUID,
  suspended_at TIMESTAMP,
  suspended_reason TEXT,
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT fk_assigned_rep FOREIGN KEY (assigned_rep_id) REFERENCES sales_reps(id) ON DELETE SET NULL,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_credit_approved_by FOREIGN KEY (credit_approved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Business Users Table (Multiple users per business account)
CREATE TABLE IF NOT EXISTS business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_account_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL, -- 'owner', 'buyer', 'accountant', 'manager', 'employee'
  
  -- Permissions
  can_place_orders BOOLEAN DEFAULT TRUE,
  can_view_invoices BOOLEAN DEFAULT TRUE,
  can_make_payments BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_view_reports BOOLEAN DEFAULT FALSE,
  spending_limit DECIMAL(10, 2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT fk_business_account FOREIGN KEY (business_account_id) REFERENCES business_accounts(id) ON DELETE CASCADE
);

-- Territory Management Table
CREATE TABLE IF NOT EXISTS territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'zip_code', 'city', 'county', 'state', 'custom'
  
  -- Geographic Boundaries
  zip_codes TEXT[], -- Array of ZIP codes
  cities TEXT[], -- Array of city names
  counties TEXT[], -- Array of county names
  states TEXT[], -- Array of state codes
  custom_boundary JSONB, -- GeoJSON for custom drawn territories
  
  -- Assignment Rules
  is_exclusive BOOLEAN DEFAULT TRUE,
  max_reps INTEGER DEFAULT 1,
  priority_level INTEGER DEFAULT 1, -- For overlapping territories
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rep-Territory Assignment Table
CREATE TABLE IF NOT EXISTS rep_territory_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL,
  territory_id UUID NOT NULL,
  
  -- Assignment Details
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID,
  is_primary BOOLEAN DEFAULT TRUE,
  commission_split DECIMAL(5, 2) DEFAULT 100.00, -- Percentage if territory is shared
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at TIMESTAMP,
  
  CONSTRAINT fk_rep FOREIGN KEY (rep_id) REFERENCES sales_reps(id) ON DELETE CASCADE,
  CONSTRAINT fk_territory FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE CASCADE,
  CONSTRAINT fk_assigned_by FOREIGN KEY (assigned_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT unique_rep_territory UNIQUE (rep_id, territory_id)
);

-- Commission Transactions Table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL,
  order_id UUID,
  business_account_id UUID,
  
  -- Transaction Details
  type VARCHAR(50) NOT NULL, -- 'sale', 'bonus', 'override', 'adjustment', 'clawback'
  description TEXT,
  
  -- Amounts
  order_amount DECIMAL(10, 2),
  commissionable_amount DECIMAL(10, 2),
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  approved_at TIMESTAMP,
  approved_by UUID,
  paid_at TIMESTAMP,
  payment_reference VARCHAR(255),
  
  -- Period
  sale_date DATE,
  commission_period VARCHAR(7), -- 'YYYY-MM' format
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_rep FOREIGN KEY (rep_id) REFERENCES sales_reps(id) ON DELETE CASCADE,
  CONSTRAINT fk_business_account FOREIGN KEY (business_account_id) REFERENCES business_accounts(id) ON DELETE SET NULL,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Rep Account Assignments History
CREATE TABLE IF NOT EXISTS rep_account_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_account_id UUID NOT NULL,
  rep_id UUID NOT NULL,
  
  -- Assignment Details
  action VARCHAR(50) NOT NULL, -- 'assigned', 'transferred', 'removed'
  reason TEXT,
  previous_rep_id UUID,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT fk_business_account FOREIGN KEY (business_account_id) REFERENCES business_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_rep FOREIGN KEY (rep_id) REFERENCES sales_reps(id) ON DELETE CASCADE,
  CONSTRAINT fk_previous_rep FOREIGN KEY (previous_rep_id) REFERENCES sales_reps(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Commission Rules Configuration
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'tiered', 'category', 'bonus', 'new_customer', 'performance'
  
  -- Rule Configuration
  conditions JSONB NOT NULL, -- Complex conditions in JSON format
  rate_structure JSONB NOT NULL, -- Rate tiers and calculations
  
  -- Applicability
  applies_to_reps UUID[], -- Specific reps, null for all
  applies_to_territories UUID[], -- Specific territories, null for all
  applies_to_products UUID[], -- Specific products, null for all
  applies_to_categories TEXT[], -- Product categories
  
  -- Validity Period
  valid_from DATE,
  valid_to DATE,
  
  -- Priority
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_accounts_rep ON business_accounts(assigned_rep_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_status ON business_accounts(status);
CREATE INDEX IF NOT EXISTS idx_business_accounts_zip ON business_accounts(billing_zip, shipping_zip);
CREATE INDEX IF NOT EXISTS idx_business_users_account ON business_users(business_account_id);
CREATE INDEX IF NOT EXISTS idx_business_users_email ON business_users(email);
CREATE INDEX IF NOT EXISTS idx_sales_reps_code ON sales_reps(rep_code);
CREATE INDEX IF NOT EXISTS idx_sales_reps_status ON sales_reps(status);
CREATE INDEX IF NOT EXISTS idx_sales_reps_manager ON sales_reps(manager_id);
CREATE INDEX IF NOT EXISTS idx_territories_type ON territories(type);
CREATE INDEX IF NOT EXISTS idx_territories_zips ON territories USING GIN(zip_codes);
CREATE INDEX IF NOT EXISTS idx_rep_territory_assignments_rep ON rep_territory_assignments(rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_territory_assignments_territory ON rep_territory_assignments(territory_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_rep ON commission_transactions(rep_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_period ON commission_transactions(commission_period);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);
CREATE INDEX IF NOT EXISTS idx_rep_account_history_account ON rep_account_history(business_account_id);
CREATE INDEX IF NOT EXISTS idx_rep_account_history_rep ON rep_account_history(rep_id);
