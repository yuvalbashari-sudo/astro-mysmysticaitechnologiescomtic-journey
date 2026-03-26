
-- Cost tracking logs table
CREATE TABLE public.cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  client_ip text,
  user_identifier text,
  feature text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  user_tier text NOT NULL DEFAULT 'free',
  ai_cost_estimate numeric(10,6) NOT NULL DEFAULT 0,
  image_cost_estimate numeric(10,6) NOT NULL DEFAULT 0,
  total_cost_estimate numeric(10,6) NOT NULL DEFAULT 0,
  model_used text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for aggregation queries
CREATE INDEX idx_cost_logs_feature_created ON public.cost_logs (feature, created_at DESC);
CREATE INDEX idx_cost_logs_user_created ON public.cost_logs (user_identifier, created_at DESC);
CREATE INDEX idx_cost_logs_ip ON public.cost_logs (client_ip, created_at DESC);
CREATE INDEX idx_cost_logs_created ON public.cost_logs (created_at DESC);

-- RLS: no public access (service_role only)
ALTER TABLE public.cost_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to cost_logs"
ON public.cost_logs
FOR ALL
TO anon, authenticated
USING (false);
