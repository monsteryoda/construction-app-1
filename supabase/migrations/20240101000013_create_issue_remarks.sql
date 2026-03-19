-- Create issue_remarks table
CREATE TABLE public.issue_remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES project_issues(id) ON DELETE CASCADE,
  remark TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.issue_remarks ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "issue_remarks_select_policy" ON public.issue_remarks
FOR SELECT TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "issue_remarks_insert_policy" ON public.issue_remarks
FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "issue_remarks_update_policy" ON public.issue_remarks
FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "issue_remarks_delete_policy" ON public.issue_remarks
FOR DELETE TO authenticated USING (auth.uid() = created_by);