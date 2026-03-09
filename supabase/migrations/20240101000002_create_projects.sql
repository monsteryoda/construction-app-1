-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  contract_number TEXT,
  client TEXT,
  consultant TEXT,
  contractor TEXT,
  contract_period INTEGER, -- in months
  date_of_commence DATE,
  date_of_completion DATE,
  defect_liability_period INTEGER, -- in months
  project_image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE TO authenticated USING (auth.uid() = user_id);