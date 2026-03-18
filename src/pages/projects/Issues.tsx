-- Create issue_remarks table
CREATE TABLE IF NOT EXISTS issue_remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES project_issues(id) ON DELETE CASCADE,
  remark TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE issue_remarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own issue remarks" ON issue_remarks
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM project_issues 
    WHERE project_issues.id = issue_remarks.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own issue remarks" ON issue_remarks
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_issues 
    WHERE project_issues.id = issue_remarks.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own issue remarks" ON issue_remarks
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM project_issues 
    WHERE project_issues.id = issue_remarks.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own issue remarks" ON issue_remarks
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM project_issues 
    WHERE project_issues.id = issue_remarks.issue_id 
    AND project_issues.user_id = auth.uid()
  )
);