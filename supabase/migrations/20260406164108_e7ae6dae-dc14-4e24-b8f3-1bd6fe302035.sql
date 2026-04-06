CREATE TABLE public.user_language_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language text NOT NULL DEFAULT 'he' CHECK (language IN ('he', 'en', 'ru', 'ar')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own language pref"
  ON public.user_language_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own language pref"
  ON public.user_language_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own language pref"
  ON public.user_language_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own language pref"
  ON public.user_language_preferences FOR DELETE
  USING (auth.uid() = user_id);