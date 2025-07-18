-- Add real sales data for commission testing
-- Period: 30/06/2025 - 30/07/2025

-- First, get staff and agent IDs (assuming they exist from setup)
-- We'll insert sales data using hard-coded UUIDs that should exist

-- Insert sample sales data with varied amounts, staff, departments, and counts
-- This will create realistic commission scenarios

-- Get current staff IDs first (you may need to adjust these UUIDs based on your actual data)
-- Sample staff for TMT and CRT departments

-- TMT Sales for July 2025
INSERT INTO sales (
  customer_name, amount, amount_in_myr, department, type, 
  staff_id, agent_id, status, is_depositor, is_fda,
  created_at, date
) VALUES
-- Mike Johnson (PE1) - High performer TMT
('Customer TMT 001', 5000.00, 5000.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, true, '2025-07-01 10:30:00+00', '2025-07-01 10:30:00+00'),

('Customer TMT 002', 8000.00, 8000.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, true, '2025-07-02 14:15:00+00', '2025-07-02 14:15:00+00'),

('Customer TMT 003', 12000.00, 12000.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, false, '2025-07-03 09:45:00+00', '2025-07-03 09:45:00+00'),

-- More TMT transactions for Mike Johnson (aiming for ~180 ND Count)
('Customer TMT 004', 3500.00, 3500.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, true, '2025-07-05 11:20:00+00', '2025-07-05 11:20:00+00'),

('Customer TMT 005', 7500.00, 7500.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, false, '2025-07-06 16:30:00+00', '2025-07-06 16:30:00+00'),

-- Jane Smith (SE1) - Medium performer TMT
('Customer TMT 006', 4500.00, 4500.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, true, '2025-07-07 12:45:00+00', '2025-07-07 12:45:00+00'),

('Customer TMT 007', 6000.00, 6000.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, false, '2025-07-08 15:20:00+00', '2025-07-08 15:20:00+00'),

('Customer TMT 008', 8500.00, 8500.00, 'TMT', 'TMT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', true, true, '2025-07-09 10:10:00+00', '2025-07-09 10:10:00+00');

-- CRT Sales for July 2025
INSERT INTO sales (
  customer_name, amount, amount_in_myr, department, type, 
  staff_id, agent_id, status, is_depositor, is_fda,
  created_at, date
) VALUES
-- Mike Johnson (PE1) - CRT transactions (aiming for ~150 reactive count)
('Customer CRT 001', 2000.00, 2000.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-01 11:30:00+00', '2025-07-01 11:30:00+00'),

('Customer CRT 002', 1500.00, 1500.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-02 13:45:00+00', '2025-07-02 13:45:00+00'),

('Customer CRT 003', 3000.00, 3000.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Mike%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-03 16:20:00+00', '2025-07-03 16:20:00+00'),

-- Jane Smith (SE1) - CRT transactions (aiming for ~120 reactive count)
('Customer CRT 004', 1800.00, 1800.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-04 09:30:00+00', '2025-07-04 09:30:00+00'),

('Customer CRT 005', 2200.00, 2200.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-05 14:15:00+00', '2025-07-05 14:15:00+00'),

('Customer CRT 006', 2800.00, 2800.00, 'CRT', 'CRT', 
 (SELECT id FROM staff WHERE name LIKE '%Jane%' LIMIT 1),
 (SELECT id FROM agents LIMIT 1),
 'closed', false, false, '2025-07-06 11:45:00+00', '2025-07-06 11:45:00+00');

-- Additional bulk inserts to reach target counts
-- For Mike Johnson PE1: Need ~180 TMT depositors and ~150 CRT transactions
DO $$
DECLARE
    mike_staff_id UUID;
    jane_staff_id UUID;
    agent_id UUID;
    i INTEGER;
BEGIN
    -- Get staff IDs
    SELECT id INTO mike_staff_id FROM staff WHERE name LIKE '%Mike%' LIMIT 1;
    SELECT id INTO jane_staff_id FROM staff WHERE name LIKE '%Jane%' LIMIT 1;
    SELECT id INTO agent_id FROM agents LIMIT 1;
    
    -- Insert more TMT records for Mike (total ~180)
    FOR i IN 1..175 LOOP
        INSERT INTO sales (
            customer_name, amount, amount_in_myr, department, type,
            staff_id, agent_id, status, is_depositor, is_fda,
            created_at, date
        ) VALUES (
            'TMT Customer Mike ' || i, 
            (RANDOM() * 8000 + 2000)::DECIMAL(15,2), 
            (RANDOM() * 8000 + 2000)::DECIMAL(15,2), 
            'TMT', 'TMT',
            mike_staff_id, agent_id, 'closed', true, 
            CASE WHEN RANDOM() > 0.7 THEN true ELSE false END,
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00',
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00'
        );
    END LOOP;
    
    -- Insert more CRT records for Mike (total ~155)
    FOR i IN 1..152 LOOP
        INSERT INTO sales (
            customer_name, amount, amount_in_myr, department, type,
            staff_id, agent_id, status, is_depositor, is_fda,
            created_at, date
        ) VALUES (
            'CRT Customer Mike ' || i, 
            (RANDOM() * 5000 + 1000)::DECIMAL(15,2), 
            (RANDOM() * 5000 + 1000)::DECIMAL(15,2), 
            'CRT', 'CRT',
            mike_staff_id, agent_id, 'closed', false, false,
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00',
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00'
        );
    END LOOP;
    
    -- Insert more TMT records for Jane (total ~150)
    FOR i IN 1..145 LOOP
        INSERT INTO sales (
            customer_name, amount, amount_in_myr, department, type,
            staff_id, agent_id, status, is_depositor, is_fda,
            created_at, date
        ) VALUES (
            'TMT Customer Jane ' || i, 
            (RANDOM() * 6000 + 2000)::DECIMAL(15,2), 
            (RANDOM() * 6000 + 2000)::DECIMAL(15,2), 
            'TMT', 'TMT',
            jane_staff_id, agent_id, 'closed', true, 
            CASE WHEN RANDOM() > 0.6 THEN true ELSE false END,
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00',
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00'
        );
    END LOOP;
    
    -- Insert more CRT records for Jane (total ~125)
    FOR i IN 1..119 LOOP
        INSERT INTO sales (
            customer_name, amount, amount_in_myr, department, type,
            staff_id, agent_id, status, is_depositor, is_fda,
            created_at, date
        ) VALUES (
            'CRT Customer Jane ' || i, 
            (RANDOM() * 4000 + 1000)::DECIMAL(15,2), 
            (RANDOM() * 4000 + 1000)::DECIMAL(15,2), 
            'CRT', 'CRT',
            jane_staff_id, agent_id, 'closed', false, false,
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00',
            '2025-07-' || LPAD((RANDOM() * 29 + 1)::TEXT, 2, '0') || ' ' || 
            LPAD((RANDOM() * 23)::TEXT, 2, '0') || ':' || 
            LPAD((RANDOM() * 59)::TEXT, 2, '0') || ':00+00'
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully inserted sales data for Mike Johnson and Jane Smith';
END $$;

-- Verify the data
SELECT 
    s.department,
    s.type,
    st.name as staff_name,
    st.position,
    COUNT(*) as transaction_count,
    COUNT(CASE WHEN s.is_depositor = true THEN 1 END) as depositor_count,
    SUM(s.amount) as total_amount
FROM sales s
LEFT JOIN staff st ON s.staff_id = st.id
WHERE s.created_at >= '2025-07-01' AND s.created_at < '2025-08-01'
GROUP BY s.department, s.type, st.name, st.position
ORDER BY st.name, s.department;

-- Check total counts per staff
SELECT 
    st.name as staff_name,
    st.position,
    COUNT(CASE WHEN s.type = 'TMT' AND s.is_depositor = true THEN 1 END) as tmt_depositors,
    COUNT(CASE WHEN s.type = 'CRT' THEN 1 END) as crt_transactions,
    SUM(CASE WHEN s.type = 'TMT' THEN s.amount ELSE 0 END) as tmt_total,
    SUM(CASE WHEN s.type = 'CRT' THEN s.amount ELSE 0 END) as crt_total
FROM staff st
LEFT JOIN sales s ON st.id = s.staff_id 
    AND s.created_at >= '2025-07-01' 
    AND s.created_at < '2025-08-01'
    AND s.status = 'closed'
WHERE st.name IN (
    SELECT name FROM staff WHERE name LIKE '%Mike%' OR name LIKE '%Jane%'
)
GROUP BY st.id, st.name, st.position
ORDER BY st.name; 