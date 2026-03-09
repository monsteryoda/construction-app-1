-- Create issue_images table
CREATE TABLE IF NOT EXISTS public.issue_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES public.project_issues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.issue_images ENABLE ROW LEVEL SECURITY;

-- Create policies for issue_images
-- Users can view their own issue images
CREATE POLICY "Users can view own issue images" ON public.issue_images
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.project_issues
    WHERE project_issues.id = issue_images.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);

-- Users can insert their own issue images
CREATE POLICY "Users can insert own issue images" ON public.issue_images
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_issues
    WHERE project_issues.id = issue_images.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);

-- Users can delete their own issue images
CREATE POLICY "Users can delete own issue images" ON public.issue_images
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.project_issues
    WHERE project_issues.id = issue_images.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);