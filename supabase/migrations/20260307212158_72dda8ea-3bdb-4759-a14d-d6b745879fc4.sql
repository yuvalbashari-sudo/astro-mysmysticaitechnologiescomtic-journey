-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE,
  email TEXT NOT NULL,
  interest TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public lead form)
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);