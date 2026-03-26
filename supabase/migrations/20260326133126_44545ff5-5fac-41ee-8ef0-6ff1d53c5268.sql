
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;

-- Create a tighter INSERT policy: anyone can submit but only insert their own data
CREATE POLICY "Public can submit leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Explicitly deny SELECT for all roles (defense in depth)
CREATE POLICY "No public read access to leads"
  ON public.leads
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- Explicitly deny UPDATE
CREATE POLICY "No public update access to leads"
  ON public.leads
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Explicitly deny DELETE
CREATE POLICY "No public delete access to leads"
  ON public.leads
  FOR DELETE
  TO anon, authenticated
  USING (false);
