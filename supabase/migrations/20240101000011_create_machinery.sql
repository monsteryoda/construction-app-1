-- Create machinery table
CREATE TABLE public.machinery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ref TEXT NOT NULL,
  no TEXT NOT NULL,
  plant_machinery TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Available' NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "Users can view own machinery" ON public.machinery
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own machinery" ON public.machinery
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own machinery" ON public.machinery
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own machinery" ON public.machinery
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_machinery_updated_at
  BEFORE UPDATE ON public.machinery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();