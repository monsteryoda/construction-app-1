-- Create project documents table
CREATE TABLE public.project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  description TEXT,
  file_url TEXT,
  file_size INTEGER,
  version TEXT DEFAULT '1.0',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "documents_select_policy" ON public.project_documents
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_policy" ON public.project_documents
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_policy" ON public.project_documents
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_policy" ON public.project_documents
FOR DELETE TO authenticated USING (auth.uid() = user_id);