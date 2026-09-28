DROP POLICY IF EXISTS "Anyone can view parties" ON public.parties;
CREATE POLICY "Signed-in users can view parties" ON public.parties
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can read news articles" ON public.news_articles;
CREATE POLICY "Signed-in users can read news articles" ON public.news_articles
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view source pages" ON public.party_source_pages;
CREATE POLICY "Signed-in users can view source pages" ON public.party_source_pages
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

REVOKE SELECT ON public.parties, public.news_articles, public.party_source_pages FROM anon;
GRANT SELECT ON public.parties, public.news_articles, public.party_source_pages TO authenticated;