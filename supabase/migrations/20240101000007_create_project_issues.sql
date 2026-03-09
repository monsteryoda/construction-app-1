-- Create project issues table
CREATE TABLE public.project_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_title TEXT NOT NULL,
  description TEXT,
  issue_type TEXT DEFAULT 'general',
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by TEXT,
  assigned_to TEXT,
  reported_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "issues_select_policy" ON public.project_issues
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "issues_insert_policy" ON public.project_issues
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "issues_update_policy" ON public.project_issues
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "issues_delete_policy" ON public.project_issues
FOR DELETE TO authenticated USING (auth.uid() = user_id);