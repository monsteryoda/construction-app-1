-- =====================================================
-- Construction Management System - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE TO authenticated USING (auth.uid() = id);

-- =====================================================
-- 2. PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  contract_number TEXT,
  client TEXT,
  consultant TEXT,
  contractor TEXT,
  contract_period INTEGER,
  date_of_commence DATE,
  date_of_completion DATE,
  defect_liability_period INTEGER,
  project_image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 3. PROJECT ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  description TEXT,
  activity_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_activities
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Project activities policies
CREATE POLICY "Users can view own activities" ON public.project_activities
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.project_activities
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.project_activities
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.project_activities
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 4. PROJECT DELIVERIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  delivery_item TEXT NOT NULL,
  description TEXT,
  delivery_date DATE,
  expected_date DATE,
  status TEXT DEFAULT 'pending',
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_deliveries
ALTER TABLE public.project_deliveries ENABLE ROW LEVEL SECURITY;

-- Project deliveries policies
CREATE POLICY "Users can view own deliveries" ON public.project_deliveries
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deliveries" ON public.project_deliveries
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deliveries" ON public.project_deliveries
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deliveries" ON public.project_deliveries
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 5. PROJECT SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  dependencies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_schedules
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;

-- Project schedules policies
CREATE POLICY "Users can view own schedules" ON public.project_schedules
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON public.project_schedules
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON public.project_schedules
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON public.project_schedules
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 6. PROJECT DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  description TEXT,
  file_url TEXT,
  file_size INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Project documents policies
CREATE POLICY "Users can view own documents" ON public.project_documents
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.project_documents
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.project_documents
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.project_documents
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 7. PROJECT ISSUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  issue_title TEXT NOT NULL,
  description TEXT,
  issue_type TEXT DEFAULT 'general',
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by TEXT,
  assigned_to TEXT,
  reported_date DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on project_issues
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;

-- Project issues policies
CREATE POLICY "Users can view own issues" ON public.project_issues
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issues" ON public.project_issues
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues" ON public.project_issues
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own issues" ON public.project_issues
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.project_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.project_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.project_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.project_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.project_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();