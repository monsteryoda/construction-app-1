-- Create delivery_images table
CREATE TABLE public.delivery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.project_deliveries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on delivery_images table
ALTER TABLE public.delivery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_images table
CREATE POLICY "Users can view own delivery images"
  ON public.delivery_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_deliveries
      WHERE project_deliveries.id = delivery_images.delivery_id
      AND project_deliveries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own delivery images"
  ON public.delivery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_deliveries
      WHERE project_deliveries.id = delivery_images.delivery_id
      AND project_deliveries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own delivery images"
  ON public.delivery_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_deliveries
      WHERE project_deliveries.id = delivery_images.delivery_id
      AND project_deliveries.user_id = auth.uid()
    )
  );

-- Storage bucket RLS policies
-- These policies control access to the storage.objects table for the delivery-images bucket

-- Policy: Allow users to upload images to their own folder in delivery-images bucket
CREATE POLICY "Users can upload delivery images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'delivery-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to view their own delivery images
CREATE POLICY "Users can view own delivery images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'delivery-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to delete their own delivery images
CREATE POLICY "Users can delete own delivery images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'delivery-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Note: Create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage → Buckets → New Bucket
-- 2. Name: delivery-images
-- 3. Enable "Public bucket" (so images can be viewed via public URL)
-- 4. Set file size limit (e.g., 5MB)
-- 5. Allowed mime types: image/png, image/jpeg, image/jpg, image/gif, image/webp