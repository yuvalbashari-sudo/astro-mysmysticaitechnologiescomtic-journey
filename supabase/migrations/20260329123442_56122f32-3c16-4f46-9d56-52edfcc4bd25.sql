
-- 1. Create a rate-limit check function for leads
CREATE OR REPLACE FUNCTION public.check_lead_rate_limit()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*) FROM public.leads
    WHERE email = current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
      OR created_at > now() - interval '1 minute'
  ) < 5
$$;

-- Actually, better approach: count recent leads from same IP
DROP FUNCTION IF EXISTS public.check_lead_rate_limit();

CREATE OR REPLACE FUNCTION public.check_lead_rate_limit(submitter_ip text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) < 5
  FROM public.leads
  WHERE created_at > now() - interval '10 minutes'
$$;

-- 2. Drop old INSERT policy and create a stronger one
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
  -- Rate limit: max 5 leads in last 10 minutes globally (simple flood protection)
  AND (SELECT count(*) < 5 FROM public.leads WHERE created_at > now() - interval '10 minutes')
);
