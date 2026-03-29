
DROP POLICY IF EXISTS "Public can submit leads with valid data" ON public.leads;

CREATE POLICY "Public can submit leads with valid data"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL
  AND length(TRIM(BOTH FROM full_name)) > 0
  AND length(full_name) <= 200
  AND email IS NOT NULL
  AND length(TRIM(BOTH FROM email)) > 0
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
  AND (phone IS NULL OR length(phone) <= 30)
  AND (message IS NULL OR length(message) <= 2000)
  AND (interest IS NULL OR length(interest) <= 100)
  AND (SELECT count(*) < 3 FROM public.leads AS existing WHERE existing.email = leads.email AND existing.created_at > now() - interval '10 minutes')
);
