-- Create project activities table
CREATE TABLE public.project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  description TEXT,
  activity_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "activities_select_policy" ON public.project_activities
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "activities_insert_policy" ON public.project_activities
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_update_policy" ON public.project_activities
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "activities_delete_policy" ON public.project_activities
FOR DELETE TO authenticated USING (auth.uid() = user_id);