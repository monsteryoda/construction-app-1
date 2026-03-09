-- Create project deliveries table
CREATE TABLE public.project_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_item TEXT NOT NULL,
  description TEXT,
  delivery_date DATE,
  expected_date DATE,
  status TEXT DEFAULT 'pending',
  quantity INTEGER,
  unit TEXT,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "deliveries_select_policy" ON public.project_deliveries
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "deliveries_insert_policy" ON public.project_deliveries
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deliveries_update_policy" ON public.project_deliveries
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "deliveries_delete_policy" ON public.project_deliveries
FOR DELETE TO authenticated USING (auth.uid() = user_id);