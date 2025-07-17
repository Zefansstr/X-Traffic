-- Add phone column to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
 
-- Add comment for documentation
COMMENT ON COLUMN sales.phone IS 'Customer phone number'; 