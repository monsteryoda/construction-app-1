-- Rename the 'name' column to 'material_name' in materials table
ALTER TABLE materials
RENAME COLUMN name TO material_name;

-- Add comment for documentation
COMMENT ON COLUMN materials.material_name IS 'Name or description of the material';