DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;

CREATE POLICY "Public can submit leads with valid data"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL AND length(trim(full_name)) > 0
  AND email IS NOT NULL AND length(trim(email)) > 0
);