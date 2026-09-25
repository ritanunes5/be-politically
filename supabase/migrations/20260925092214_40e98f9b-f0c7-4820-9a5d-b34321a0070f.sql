ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_published_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS original_excerpt text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unverified';

CREATE OR REPLACE FUNCTION public.validate_proposal_status() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('verified','outdated','unverified') THEN
    RAISE EXCEPTION 'invalid status %', NEW.status;
  END IF;
  NEW.is_validated := (NEW.status = 'verified');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS proposals_validate_status ON public.proposals;
CREATE TRIGGER proposals_validate_status BEFORE INSERT OR UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.validate_proposal_status();

UPDATE public.proposals p SET
  status = CASE WHEN is_validated THEN 'verified' ELSE 'unverified' END,
  source_name = COALESCE(source_name, (SELECT name FROM public.parties WHERE id = p.party_id) || ' (site oficial)'),
  last_verified_at = COALESCE(last_verified_at, last_verified_date::timestamptz, now());

CREATE UNIQUE INDEX IF NOT EXISTS proposals_party_hash_uidx ON public.proposals(party_id, content_hash) WHERE content_hash IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can view validated proposals" ON public.proposals;
CREATE POLICY "Anyone can view verified sourced proposals" ON public.proposals FOR SELECT
USING (status = 'verified' AND official_source_url IS NOT NULL AND source_name IS NOT NULL AND last_verified_at IS NOT NULL);

CREATE TABLE public.party_source_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  url text NOT NULL,
  source_name text NOT NULL,
  source_document_name text,
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  last_content_hash text,
  last_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (party_id, url)
);
GRANT SELECT ON public.party_source_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_source_pages TO authenticated;
GRANT ALL ON public.party_source_pages TO service_role;
ALTER TABLE public.party_source_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view source pages" ON public.party_source_pages FOR SELECT USING (true);
CREATE POLICY "Admins manage source pages" ON public.party_source_pages FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER party_source_pages_updated BEFORE UPDATE ON public.party_source_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.party_source_pages (party_id, url, source_name, source_document_name)
SELECT DISTINCT ON (pr.party_id, pr.official_source_url) pr.party_id, pr.official_source_url,
  pa.name || ' (site oficial)', pr.source_document_name
FROM public.proposals pr JOIN public.parties pa ON pa.id = pr.party_id
WHERE pr.official_source_url IS NOT NULL
ON CONFLICT DO NOTHING;