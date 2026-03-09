-- Create schedule_images table
CREATE TABLE public.schedule_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.project_schedules(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on schedule_images table
ALTER TABLE public.schedule_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_images table
CREATE POLICY "Users can view own schedule images"
  ON public.schedule_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_images.schedule_id
      AND project_schedules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own schedule images"
  ON public.schedule_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_images.schedule_id
      AND project_schedules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own schedule images"
  ON public.schedule_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_images.schedule_id
      AND project_schedules.user_id = auth.uid()
    )
  );

-- Storage bucket RLS policies
-- Policy: Allow users to upload images to their own folder in schedule-images bucket
CREATE POLICY "Users can upload schedule images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'schedule-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to view their own schedule images
CREATE POLICY "Users can view own schedule images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'schedule-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow users to delete their own schedule images
CREATE POLICY "Users can delete own schedule images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'schedule-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Note: Create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage → Buckets → New Bucket
-- 2. Name: schedule-images
-- 3. Enable "Public bucket" (so images can be viewed via public URL)
-- 4. Set file size limit (e.g., 5MB)
-- 5. Allowed mime types: image/png, image/jpeg, image/jpg, image/gif, image/webp