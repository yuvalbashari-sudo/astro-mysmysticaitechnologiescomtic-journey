
-- Rate limit tracking table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ip text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_ip_action_time ON public.rate_limits (client_ip, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to manage this table
-- No public access policies needed
CREATE POLICY "No public access to rate_limits"
  ON public.rate_limits
  FOR ALL
  TO anon, authenticated
  USING (false);

-- Auto-cleanup: remove entries older than 24 hours via a function
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '24 hours';
$$;

-- Abuse log table for monitoring
CREATE TABLE public.abuse_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ip text,
  action text NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abuse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to abuse_logs"
  ON public.abuse_logs
  FOR ALL
  TO anon, authenticated
  USING (false);

CREATE INDEX idx_abuse_logs_time ON public.abuse_logs (created_at DESC);
