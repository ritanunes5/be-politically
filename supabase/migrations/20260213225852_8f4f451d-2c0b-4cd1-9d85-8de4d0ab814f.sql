
-- Fix column defaults (remove string literals that were incorrectly set)
ALTER TABLE public.news_articles 
  ALTER COLUMN url SET DEFAULT NULL,
  ALTER COLUMN source SET DEFAULT NULL,
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN category SET DEFAULT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN title SET DEFAULT NULL,
  ALTER COLUMN title SET NOT NULL;

-- Add unique constraint on url to prevent duplicates
ALTER TABLE public.news_articles
  ADD CONSTRAINT news_articles_url_unique UNIQUE (url);

-- Allow everyone to read news articles (public content)
CREATE POLICY "Anyone can read news articles"
  ON public.news_articles
  FOR SELECT
  USING (true);

-- Allow service role inserts (edge function uses service role key)
-- The existing restrictive INSERT policy blocks anon, which is fine.
