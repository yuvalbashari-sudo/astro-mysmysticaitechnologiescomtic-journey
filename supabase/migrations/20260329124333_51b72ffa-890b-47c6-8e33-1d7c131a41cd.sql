
-- Replace global rate limit with per-email rate limit in leads INSERT policy
DROP POLICY IF EXISTS "Public can submit leads with valid data" ON public.leads;

CREATE POLICY "Public can submit leads with valid data"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Name validation
  full_name IS NOT NULL
  AND length(TRIM(BOTH FROM full_name)) > 0
  AND length(full_name) <= 200
  -- Email format and length validation
  AND email IS NOT NULL
  AND length(TRIM(BOTH FROM email)) > 0
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
  -- Phone length limit
  AND (phone IS NULL OR length(phone) <= 30)
  -- Message length limit
  AND (message IS NULL OR length(message) <= 2000)
  -- Interest length limit
  AND (interest IS NULL OR length(interest) <= 100)
  -- Per-email rate limit: max 3 submissions per email in last 10 minutes
  AND (SELECT count(*) < 3 FROM public.leads WHERE leads.email = email AND created_at > now() - interval '10 minutes')
);
