# Refactor parties + proposals to Supabase-backed, source-based system

## Scope

Keep the exact 8 existing parties (PS, PSD, Chega, IL, BE, PCP, PAN, LIVRE). No additions, no removals. Replace fake/unsourced content with sourced data, move all to Supabase, build an admin dashboard for proposals.

## 1. Database (Supabase migration)

**`parties`** — seeded with the 8 existing parties only
- `id` (uuid, pk), `existing_party_key` (text unique — `ps`, `psd`, `chega`, `il`, `be`, `pcp`, `pan`, `livre`)
- `name`, `acronym`, `short_neutral_description`, `official_website`, `logo_url`
- `last_verified_date` (date), `created_at`

**`proposals`**
- `id`, `party_id` → `parties.id`
- `category` (e.g. Habitação, Saúde, Fiscalidade, Ambiente, Educação, Justiça)
- `title`, `neutral_summary`, `official_source_url`, `source_document_name`
- `last_verified_date`, `is_validated` (default false), `created_at`

**`proposal_sources`**
- `id`, `proposal_id` → `proposals.id`
- `source_type` (programa_eleitoral / projeto_lei / declaracao_oficial / site_oficial)
- `url`, `source_document_name`, `original_excerpt`, `created_at`

**RLS**
- `parties`, `proposals` (only `is_validated = true`), `proposal_sources`: public SELECT
- All write ops: admin only (via `has_role(auth.uid(), 'admin')`)
- DB-level: block INSERT/DELETE on `parties` for everyone (admins UPDATE only)

**Seed**
- Insert the 8 parties with neutral descriptions, official site (e.g. `ps.pt`, `psd.pt`, `partidochega.pt`, `iniciativaliberal.pt`, `bloco.org`, `pcp.pt`, `pan.com.pt`, `partidolivre.pt`), `last_verified_date = 2025-05-22`
- Seed 2–3 proposals per party drawn from each party's published 2024/2025 electoral programme, each with `official_source_url`, `source_document_name`, and `is_validated = true`. Neutral wording only.

## 2. Frontend (data layer)

- New `src/hooks/useParties.ts` and `useParty(key)` → Supabase queries
- New `src/hooks/useProposals(partyId)` → only validated, grouped by `category`
- Keep `src/data/parties.ts` only for static UI metadata (color, local logo asset, key) — remove fake history/proposals/recentActivity arrays
- Update `Parties.tsx`, `PartyDetail.tsx`, `Compare.tsx`, `Favorites.tsx`, `History.tsx` to use hooks
- `PartyDetail.tsx`: render proposals grouped by category with source URL, source document name, and last verified date under each. Remove “Recent Activity” fake block.

## 3. Admin dashboard

New `/admin` route, guarded by `has_role` = admin.

- Parties tab: list 8 parties, edit-only form (name, acronym, description, website, logo_url, last_verified_date). No create/delete buttons.
- Proposals tab: CRUD on proposals
  - Create/edit form: party (select from 8), category, title, neutral_summary, official_source_url, source_document_name, last_verified_date
  - “Validate” action disabled unless `official_source_url` + `source_document_name` are present
  - Biased-language linter (client-side): regex check for words like *extremista, radical, perigoso, perfeito, terrível, corrupto, patriótico, anti-povo*; show warning + suggest neutral phrasing before save
  - Sources sub-section: add/remove `proposal_sources` rows

## 4. Neutrality + audit

- Strip biased adjectives from all seeded copy (descriptions, summaries)
- Remove fake `recentActivity`, fake dates, invented proposal text from `src/data/parties.ts`
- Add a shared `lib/neutrality.ts` with the biased-word list, used by admin form

## Technical notes

- Types regenerate automatically after migration
- Local logo imports stay (mapped by `existing_party_key`) so logos keep working offline; `logo_url` in DB is optional override
- Admin role check uses existing `has_role` security-definer function and `user_roles` table
- Only one user can be promoted to admin manually via SQL; document this in the migration description
