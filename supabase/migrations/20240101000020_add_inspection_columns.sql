-- Add additional columns to inspections table if needed
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS site_manager TEXT,
ADD COLUMN IF NOT EXISTS safety_officer TEXT,
ADD COLUMN IF NOT EXISTS quality_control TEXT,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS next_inspection_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add RLS policies for the new columns (they inherit existing policies)
-- No additional policies needed as they use the same user_id for access control