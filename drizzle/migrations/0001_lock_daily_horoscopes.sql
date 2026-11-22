DROP POLICY IF EXISTS "Anyone can read daily horoscopes" ON public.daily_horoscopes;
DROP POLICY IF EXISTS "Anyone can insert daily horoscopes" ON public.daily_horoscopes;
REVOKE ALL ON public.daily_horoscopes FROM anon, authenticated;
GRANT ALL ON public.daily_horoscopes TO service_role;
ALTER TABLE public.daily_horoscopes ENABLE ROW LEVEL SECURITY;