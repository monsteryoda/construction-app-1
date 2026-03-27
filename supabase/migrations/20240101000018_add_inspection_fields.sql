-- Add additional fields to inspections table
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS work_category TEXT,
ADD COLUMN IF NOT EXISTS contractor TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS inspection_time TEXT,
ADD COLUMN IF NOT EXISTS intended_date DATE,
ADD COLUMN IF NOT EXISTS intended_time TEXT;

-- Add comments for documentation
COMMENT ON COLUMN inspections.work_category IS 'Type of work being inspected (e.g., FIRE FIGHTING WORK, ELECTRICAL WORK)';
COMMENT ON COLUMN inspections.contractor IS 'Contractor requesting the inspection';
COMMENT ON COLUMN inspections.description IS 'Description of the work to be inspected';
COMMENT ON COLUMN inspections.zone IS 'Zone where the work is located';
COMMENT ON COLUMN inspections.location IS 'Specific location within the zone';
COMMENT ON COLUMN inspections.inspection_time IS 'Time of the inspection';
COMMENT ON COLUMN inspections.intended_date IS 'Intended date for work to commence';
COMMENT ON COLUMN inspections.intended_time IS 'Intended time for work to commence';