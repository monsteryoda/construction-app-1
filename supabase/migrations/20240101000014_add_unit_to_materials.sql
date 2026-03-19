-- Add unit column to materials table
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS unit TEXT;

-- Add comment for documentation
COMMENT ON COLUMN materials.unit IS 'Unit of measurement for the material (e.g., kg, pcs, m, tons)';