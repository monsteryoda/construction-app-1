-- Create inspections table
CREATE TABLE public.inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  inspection_type TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspector_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  findings TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for each operation
CREATE POLICY "inspections_select_policy" ON public.inspections
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "inspections_insert_policy" ON public.inspections
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inspections_update_policy" ON public.inspections
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "inspections_delete_policy" ON public.inspections
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();