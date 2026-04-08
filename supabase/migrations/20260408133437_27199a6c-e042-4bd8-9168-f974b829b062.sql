
CREATE TABLE public.daily_horoscopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fingerprint text NOT NULL,
  horoscope_date date NOT NULL DEFAULT CURRENT_DATE,
  language text NOT NULL DEFAULT 'he',
  zodiac_sign text,
  content text NOT NULL,
  love_score smallint DEFAULT 3,
  career_score smallint DEFAULT 3,
  energy_score smallint DEFAULT 3,
  birth_date text,
  user_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one horoscope per user per day per language
CREATE UNIQUE INDEX idx_daily_horoscope_unique ON public.daily_horoscopes (user_fingerprint, horoscope_date, language);

-- Index for quick lookups
CREATE INDEX idx_daily_horoscope_lookup ON public.daily_horoscopes (user_fingerprint, horoscope_date);

-- Auto-cleanup old records (keep 7 days)
CREATE INDEX idx_daily_horoscope_date ON public.daily_horoscopes (horoscope_date);

-- Enable RLS
ALTER TABLE public.daily_horoscopes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read
CREATE POLICY "Anyone can read daily horoscopes"
ON public.daily_horoscopes FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anonymous insert
CREATE POLICY "Anyone can insert daily horoscopes"
ON public.daily_horoscopes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No update or delete
