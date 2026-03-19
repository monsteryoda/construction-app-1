-- Add unit_price column to materials table
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Add supplier column to materials table
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS supplier TEXT;

-- Add comments for documentation
COMMENT ON COLUMN materials.unit_price IS 'Unit price in Malaysian Ringgit (RM)';
COMMENT ON COLUMN materials.supplier IS 'Name of the material supplier';