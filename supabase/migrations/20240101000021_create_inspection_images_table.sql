-- Create inspection_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS inspection_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE inspection_images ENABLE ROW LEVEL SECURITY;

-- Create policies for each operation
CREATE POLICY "Users can view own inspection images" ON inspection_images
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own inspection images" ON inspection_images
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own inspection images" ON inspection_images
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inspection_images_inspection_id 
ON inspection_images(inspection_id);

-- Create index for faster queries by created_at
CREATE INDEX IF NOT EXISTS idx_inspection_images_created_at 
ON inspection_images(created_at DESC);