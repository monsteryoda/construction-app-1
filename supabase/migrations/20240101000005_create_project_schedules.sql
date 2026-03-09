-- Create project schedules table
CREATE TABLE public.project_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0, -- percentage
  status TEXT DEFAULT 'not_started',
  dependencies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "schedules_select_policy" ON public.project_schedules
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "schedules_insert_policy" ON public.project_schedules
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedules_update_policy" ON public.project_schedules
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "schedules_delete_policy" ON public.project_schedules
FOR DELETE TO authenticated USING (auth.uid() = user_id);