-- Users table for authentication and authorization
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Insert default administrator user (password: admin123)
-- Note: In production, use a secure password hash
INSERT INTO users (username, email, password_hash, role, full_name, is_active) 
VALUES (
  'admin', 
  'admin@trafficsolution.com', 
  'YWRtaW4xMjM=', -- Base64 encoded 'admin123'
  'administrator', 
  'System Administrator', 
  true
) ON CONFLICT (username) DO NOTHING;

-- Insert sample users for testing
INSERT INTO users (username, email, password_hash, role, full_name, is_active) 
VALUES 
  ('manager', 'manager@trafficsolution.com', 'bWFuYWdlcjEyMw==', 'manager', 'Manager User', true),
  ('operator', 'operator@trafficsolution.com', 'b3BlcmF0b3IxMjM=', 'operator', 'Operator User', true),
  ('user1', 'user1@trafficsolution.com', 'dXNlcjEyMw==', 'user', 'Regular User', true),
  ('viewer', 'viewer@trafficsolution.com', 'dmlld2VyMTIz', 'viewer', 'Viewer User', true)
ON CONFLICT (username) DO NOTHING;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 