-- =====================================================
-- COMPLETE DATABASE SETUP FOR SALES DASHBOARD
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (required for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('administrator', 'manager', 'operator', 'user', 'viewer')),
  full_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints for departments if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'departments_name_key'
    ) THEN
        ALTER TABLE departments ADD CONSTRAINT departments_name_key UNIQUE (name);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'departments_code_key'
    ) THEN
        ALTER TABLE departments ADD CONSTRAINT departments_code_key UNIQUE (code);
    END IF;
END $$;

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL CHECK (position IN ('SE1', 'SE2', 'PE1', 'PE', 'Manager')),
  email VARCHAR(255),
  phone VARCHAR(50),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AGENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRAFFIC TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS traffic (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- GAMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXCHANGE RATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL CHECK (from_currency IN ('USD', 'IDR', 'MYR')),
  to_currency VARCHAR(3) NOT NULL CHECK (to_currency IN ('USD', 'IDR', 'MYR')),
  rate DECIMAL(10, 4) NOT NULL CHECK (rate > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- =====================================================
-- COMMISSION RATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS commission_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('SE1', 'SE2', 'PE1', 'PE2', 'Manager')),
  tmt_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  crt_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  bdv_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(position)
);

-- =====================================================
-- SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  department VARCHAR(50) NOT NULL,
  staff_id UUID REFERENCES staff(id),
  agent_id UUID REFERENCES agents(id),
  traffic_id UUID REFERENCES traffic(id),
  device_id UUID REFERENCES devices(id),
  game_id UUID REFERENCES games(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIGGER FUNCTION FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_traffic_updated_at ON traffic;
CREATE TRIGGER update_traffic_updated_at 
    BEFORE UPDATE ON traffic 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at 
    BEFORE UPDATE ON devices 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON games 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_rates_updated_at ON exchange_rates;
CREATE TRIGGER update_exchange_rates_updated_at 
    BEFORE UPDATE ON exchange_rates 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_rates_updated_at ON commission_rates;
CREATE TRIGGER update_commission_rates_updated_at 
    BEFORE UPDATE ON commission_rates 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Departments
INSERT INTO departments (name, code, description) 
SELECT 'Traffic Management Team', 'TMT', 'Department untuk mengelola traffic dan distribusi'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'TMT');

INSERT INTO departments (name, code, description) 
SELECT 'Customer Relations Team', 'CRT', 'Department untuk customer service dan support'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'CRT');

INSERT INTO departments (name, code, description) 
SELECT 'Business Development', 'BDV', 'Department untuk pengembangan bisnis dan partnership'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'BDV');

-- Sample Users (5 roles)
INSERT INTO users (username, email, password_hash, role, full_name) 
SELECT 'admin', 'admin@trafficsolution.com', encode('admin123', 'base64'), 'administrator', 'System Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, email, password_hash, role, full_name) 
SELECT 'manager', 'manager@trafficsolution.com', encode('manager123', 'base64'), 'manager', 'Manager User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

INSERT INTO users (username, email, password_hash, role, full_name) 
SELECT 'operator', 'operator@trafficsolution.com', encode('operator123', 'base64'), 'operator', 'Operator User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'operator');

INSERT INTO users (username, email, password_hash, role, full_name) 
SELECT 'user1', 'user1@trafficsolution.com', encode('user123', 'base64'), 'user', 'Regular User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1');

INSERT INTO users (username, email, password_hash, role, full_name) 
SELECT 'viewer', 'viewer@trafficsolution.com', encode('viewer123', 'base64'), 'viewer', 'Viewer User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'viewer');

-- Sample Agents
INSERT INTO agents (name, description) 
SELECT 'Agent Alpha', 'Primary sales agent'
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Agent Alpha');

INSERT INTO agents (name, description) 
SELECT 'Agent Beta', 'Secondary sales agent'
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Agent Beta');

-- Sample Traffic
INSERT INTO traffic (name, description) 
SELECT 'Organic Search', 'Traffic dari pencarian organik'
WHERE NOT EXISTS (SELECT 1 FROM traffic WHERE name = 'Organic Search');

INSERT INTO traffic (name, description) 
SELECT 'Paid Ads', 'Traffic dari iklan berbayar'
WHERE NOT EXISTS (SELECT 1 FROM traffic WHERE name = 'Paid Ads');

-- Sample Devices
INSERT INTO devices (name, description) 
SELECT 'Desktop', 'Akses dari komputer desktop'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE name = 'Desktop');

INSERT INTO devices (name, description) 
SELECT 'Mobile', 'Akses dari perangkat mobile'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE name = 'Mobile');

-- Sample Games
INSERT INTO games (name, description) 
SELECT 'Poker', 'Permainan poker online'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE name = 'Poker');

INSERT INTO games (name, description) 
SELECT 'Slots', 'Permainan slot machine'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE name = 'Slots');

-- Sample Exchange Rates
INSERT INTO exchange_rates (from_currency, to_currency, rate) 
SELECT 'USD', 'IDR', 15500.00
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE from_currency = 'USD' AND to_currency = 'IDR');

INSERT INTO exchange_rates (from_currency, to_currency, rate) 
SELECT 'USD', 'MYR', 4.75
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE from_currency = 'USD' AND to_currency = 'MYR');

-- Sample Commission Rates
INSERT INTO commission_rates (position, tmt_rate, crt_rate, bdv_rate) 
SELECT 'SE1', 5.00, 4.50, 6.00
WHERE NOT EXISTS (SELECT 1 FROM commission_rates WHERE position = 'SE1');

INSERT INTO commission_rates (position, tmt_rate, crt_rate, bdv_rate) 
SELECT 'SE2', 7.00, 6.50, 8.00
WHERE NOT EXISTS (SELECT 1 FROM commission_rates WHERE position = 'SE2');

INSERT INTO commission_rates (position, tmt_rate, crt_rate, bdv_rate) 
SELECT 'PE1', 10.00, 9.50, 11.00
WHERE NOT EXISTS (SELECT 1 FROM commission_rates WHERE position = 'PE1');

INSERT INTO commission_rates (position, tmt_rate, crt_rate, bdv_rate) 
SELECT 'Manager', 15.00, 14.50, 16.00
WHERE NOT EXISTS (SELECT 1 FROM commission_rates WHERE position = 'Manager');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment these to verify setup
-- SELECT 'users' as table_name, count(*) as row_count FROM users
-- UNION ALL
-- SELECT 'departments', count(*) FROM departments
-- UNION ALL  
-- SELECT 'agents', count(*) FROM agents
-- UNION ALL
-- SELECT 'traffic', count(*) FROM traffic
-- UNION ALL
-- SELECT 'devices', count(*) FROM devices
-- UNION ALL
-- SELECT 'games', count(*) FROM games
-- UNION ALL
-- SELECT 'exchange_rates', count(*) FROM exchange_rates
-- UNION ALL
-- SELECT 'commission_rates', count(*) FROM commission_rates; 