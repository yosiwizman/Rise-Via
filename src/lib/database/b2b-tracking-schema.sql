-- B2B Tracking System Database Schema
-- Phase 4: Map & Real-Time Tracking Implementation

-- Delivery Routes Table
CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id),
  route_date DATE NOT NULL,
  route_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  total_stops INTEGER DEFAULT 0,
  completed_stops INTEGER DEFAULT 0,
  total_distance_miles DECIMAL(10, 2),
  actual_distance_miles DECIMAL(10, 2),
  planned_start_time TIMESTAMP,
  actual_start_time TIMESTAMP,
  planned_end_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  vehicle_id VARCHAR(100),
  manifest_numbers TEXT[], -- Array of METRC manifest numbers
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Location Tracking Table (Real-time GPS)
CREATE TABLE IF NOT EXISTS location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_type VARCHAR(50), -- driver, sales_rep
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- GPS accuracy in meters
  altitude DECIMAL(10, 2),
  heading DECIMAL(5, 2), -- Direction in degrees
  speed DECIMAL(5, 2), -- Speed in mph
  activity VARCHAR(50), -- stationary, walking, driving
  battery_level INTEGER,
  is_mock_location BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient location queries
CREATE INDEX idx_location_tracking_user_time ON location_tracking(user_id, recorded_at DESC);
CREATE INDEX idx_location_tracking_coordinates ON location_tracking USING GIST (
  point(longitude, latitude)
);

-- Visit Logs Table (Sales Rep Check-ins)
CREATE TABLE IF NOT EXISTS visit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID REFERENCES users(id),
  business_account_id UUID REFERENCES business_accounts(id),
  check_in_time TIMESTAMP NOT NULL,
  check_in_latitude DECIMAL(10, 8),
  check_in_longitude DECIMAL(11, 8),
  check_out_time TIMESTAMP,
  check_out_latitude DECIMAL(10, 8),
  check_out_longitude DECIMAL(11, 8),
  visit_duration_minutes INTEGER,
  visit_type VARCHAR(50), -- sales_call, delivery, service, collection
  visit_outcome VARCHAR(50), -- successful, no_answer, rescheduled, cancelled
  order_placed BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  photos TEXT[], -- Array of photo URLs
  mileage_start DECIMAL(10, 2),
  mileage_end DECIMAL(10, 2),
  signature_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Delivery Manifests Table (METRC Integration)
CREATE TABLE IF NOT EXISTS delivery_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_number VARCHAR(100) UNIQUE NOT NULL,
  metrc_manifest_id VARCHAR(100),
  route_id UUID REFERENCES delivery_routes(id),
  driver_id UUID REFERENCES users(id),
  vehicle_id VARCHAR(100),
  departure_facility VARCHAR(200),
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, delivered, rejected
  total_packages INTEGER,
  total_weight_grams DECIMAL(10, 2),
  temperature_readings JSONB, -- Array of temperature logs
  chain_of_custody JSONB, -- Custody transfer records
  compliance_checks JSONB,
  seal_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Geofence Zones Table (Compliance & Restricted Areas)
CREATE TABLE IF NOT EXISTS geofence_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name VARCHAR(200) NOT NULL,
  zone_type VARCHAR(50) NOT NULL, -- school, federal_property, restricted, delivery_zone
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_meters INTEGER, -- For circular zones
  polygon_coordinates JSONB, -- For complex shapes
  restrictions JSONB, -- Specific restrictions for this zone
  alert_enabled BOOLEAN DEFAULT TRUE,
  alert_message TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index for geofence queries
CREATE INDEX idx_geofence_zones_location ON geofence_zones USING GIST (
  point(center_longitude, center_latitude)
);

-- Delivery Stops Table
CREATE TABLE IF NOT EXISTS delivery_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES delivery_routes(id),
  business_account_id UUID REFERENCES business_accounts(id),
  order_id UUID REFERENCES orders(id),
  stop_number INTEGER NOT NULL,
  planned_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  actual_departure TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, arrived, completed, failed, skipped
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  signature_url TEXT,
  photo_urls TEXT[],
  proof_of_delivery JSONB,
  temperature_at_delivery DECIMAL(5, 2),
  notes TEXT,
  failure_reason VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GPS Breadcrumbs Table (Historical tracking)
CREATE TABLE IF NOT EXISTS gps_breadcrumbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES delivery_routes(id),
  user_id UUID REFERENCES users(id),
  breadcrumb_data JSONB NOT NULL, -- Array of GPS points
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_points INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mileage Logs Table (Expense Tracking)
CREATE TABLE IF NOT EXISTS mileage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  log_date DATE NOT NULL,
  start_odometer DECIMAL(10, 2),
  end_odometer DECIMAL(10, 2),
  total_miles DECIMAL(10, 2),
  business_miles DECIMAL(10, 2),
  personal_miles DECIMAL(10, 2),
  rate_per_mile DECIMAL(5, 2),
  total_reimbursement DECIMAL(10, 2),
  notes TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Temperature Logs Table (Cold Chain Monitoring)
CREATE TABLE IF NOT EXISTS temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID REFERENCES delivery_manifests(id),
  route_id UUID REFERENCES delivery_routes(id),
  temperature_celsius DECIMAL(5, 2) NOT NULL,
  temperature_fahrenheit DECIMAL(5, 2) NOT NULL,
  humidity_percent DECIMAL(5, 2),
  sensor_id VARCHAR(100),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_type VARCHAR(50), -- too_high, too_low, sensor_failure
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery Notifications Table
CREATE TABLE IF NOT EXISTS delivery_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_stop_id UUID REFERENCES delivery_stops(id),
  recipient_id UUID REFERENCES users(id),
  notification_type VARCHAR(50), -- sms, email, push
  notification_status VARCHAR(50), -- pending, sent, delivered, failed
  message TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_delivery_routes_driver_date ON delivery_routes(driver_id, route_date DESC);
CREATE INDEX idx_delivery_routes_status ON delivery_routes(status);
CREATE INDEX idx_visit_logs_rep_date ON visit_logs(rep_id, check_in_time DESC);
CREATE INDEX idx_visit_logs_account ON visit_logs(business_account_id);
CREATE INDEX idx_delivery_stops_route ON delivery_stops(route_id, stop_number);
CREATE INDEX idx_delivery_stops_status ON delivery_stops(status);
CREATE INDEX idx_temperature_logs_manifest ON temperature_logs(manifest_id, recorded_at DESC);
CREATE INDEX idx_mileage_logs_user_date ON mileage_logs(user_id, log_date DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW active_deliveries AS
SELECT 
  dr.*,
  u.first_name || ' ' || u.last_name as driver_name,
  COUNT(ds.id) as total_stops,
  COUNT(CASE WHEN ds.status = 'completed' THEN 1 END) as completed_stops
FROM delivery_routes dr
LEFT JOIN users u ON dr.driver_id = u.id
LEFT JOIN delivery_stops ds ON ds.route_id = dr.id
WHERE dr.status IN ('planned', 'in_progress')
  AND dr.route_date = CURRENT_DATE
GROUP BY dr.id, u.first_name, u.last_name;

CREATE OR REPLACE VIEW rep_visit_summary AS
SELECT 
  vl.rep_id,
  u.first_name || ' ' || u.last_name as rep_name,
  DATE(vl.check_in_time) as visit_date,
  COUNT(*) as total_visits,
  SUM(vl.visit_duration_minutes) as total_duration_minutes,
  COUNT(CASE WHEN vl.order_placed THEN 1 END) as orders_placed,
  COUNT(CASE WHEN vl.visit_outcome = 'successful' THEN 1 END) as successful_visits
FROM visit_logs vl
LEFT JOIN users u ON vl.rep_id = u.id
GROUP BY vl.rep_id, u.first_name, u.last_name, DATE(vl.check_in_time);
