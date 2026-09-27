DROP INDEX IF EXISTS public.proposals_party_hash_uidx;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_party_hash_key UNIQUE (party_id, content_hash);