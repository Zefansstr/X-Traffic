-- =====================================================
-- SUPABASE DATABASE SCHEMA FOR SALES DASHBOARD
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL CHECK (position IN ('SE1', 'SE2', 'PE1', 'PE2', 'Manager')),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AGENTS TABLE
-- =====================================================
CREATE TABLE agents (
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
CREATE TABLE traffic (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEVICES TABLE
-- =====================================================
CREATE TABLE devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- GAMES TABLE
-- =====================================================
CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXCHANGE RATES TABLE
-- =====================================================
CREATE TABLE exchange_rates (
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
CREATE TABLE commission_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('SE1', 'SE2', 'PE1', 'PE2', 'Manager')),
  tmt_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  crt_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  kpi_target INTEGER DEFAULT 0,
  depositor_target INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SALES TABLE (MAIN TABLE)
-- =====================================================
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  deposit DECIMAL(15, 2) NOT NULL,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  traffic_id UUID REFERENCES traffic(id) ON DELETE SET NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  department VARCHAR(100) NOT NULL,
  exchange_rate DECIMAL(10, 4) DEFAULT 1,
  amount DECIMAL(15, 2) DEFAULT 0,
  amount_in_myr DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MYR',
  type VARCHAR(50) DEFAULT 'TMT',
  status VARCHAR(20) DEFAULT 'closed' CHECK (status IN ('pending', 'closed', 'cancelled')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  is_depositor BOOLEAN DEFAULT false,
  is_fda BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_sales_staff_id ON sales(staff_id);
CREATE INDEX idx_sales_agent_id ON sales(agent_id);
CREATE INDEX idx_sales_department ON sales(department);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);

-- =====================================================
-- FUNCTIONS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_traffic_updated_at BEFORE UPDATE ON traffic FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_commission_rates_updated_at BEFORE UPDATE ON commission_rates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default Departments
INSERT INTO departments (name, code, description) VALUES 
  ('TMT', 'TMT', 'TMT Customer Closing'),
  ('CRT', 'CRT', 'Customer Registration Team');

-- Default Commission Rates
INSERT INTO commission_rates (position, tmt_rate, crt_rate, kpi_target, depositor_target) VALUES 
  ('SE1', 15.00, 10.00, 50, 20),
  ('SE2', 20.00, 15.00, 75, 30),
  ('PE1', 25.00, 20.00, 100, 40),
  ('PE2', 30.00, 25.00, 125, 50),
  ('Manager', 35.00, 30.00, 150, 60);

-- Default Exchange Rates
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES 
  ('USD', 'MYR', 4.7073),
  ('IDR', 'MYR', 0.0003),
  ('MYR', 'USD', 0.2124);

-- =====================================================
-- ROW LEVEL SECURITY (OPTIONAL - untuk keamanan)
-- =====================================================
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- Tambahkan policy sesuai kebutuhan

-- =====================================================
-- VIEWS UNTUK REPORTING (OPTIONAL)
-- =====================================================
CREATE VIEW sales_with_details AS
SELECT 
  s.id,
  s.customer_name,
  s.deposit,
  s.amount,
  s.amount_in_myr,
  s.department,
  s.status,
  s.date,
  s.notes,
  st.name as staff_name,
  st.position as staff_position,
  a.name as agent_name,
  t.name as traffic_name,
  d.name as device_name,
  g.name as game_name,
  s.created_at,
  s.updated_at
FROM sales s
LEFT JOIN staff st ON s.staff_id = st.id
LEFT JOIN agents a ON s.agent_id = a.id
LEFT JOIN traffic t ON s.traffic_id = t.id
LEFT JOIN devices d ON s.device_id = d.id
LEFT JOIN games g ON s.game_id = g.id
ORDER BY s.created_at DESC; 