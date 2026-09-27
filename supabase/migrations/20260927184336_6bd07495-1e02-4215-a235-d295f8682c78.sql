ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS electoral_program_url text,
  ADD COLUMN IF NOT EXISTS electoral_program_name text,
  ADD COLUMN IF NOT EXISTS electoral_program_year integer;
ALTER TABLE public.party_source_pages
  ADD COLUMN IF NOT EXISTS needs_reverification boolean NOT NULL DEFAULT false;