-- Create materials table
CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  no TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity TEXT NOT NULL,
  delivery_order_ref TEXT,
  status TEXT DEFAULT 'In Stock' NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "Users can view own materials" ON public.materials
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials" ON public.materials
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials" ON public.materials
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials" ON public.materials
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();