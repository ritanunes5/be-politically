
-- =========================
-- PARTIES
-- =========================
CREATE TABLE public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  existing_party_key text NOT NULL UNIQUE,
  name text NOT NULL,
  acronym text NOT NULL,
  short_neutral_description text,
  official_website text,
  logo_url text,
  last_verified_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view parties"
  ON public.parties FOR SELECT
  USING (true);

CREATE POLICY "Admins can update parties"
  ON public.parties FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No INSERT/DELETE policies => disallowed for everyone (including admins) via RLS.

CREATE TRIGGER update_parties_updated_at
  BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- PROPOSALS
-- =========================
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  neutral_summary text NOT NULL,
  official_source_url text,
  source_document_name text,
  last_verified_date date,
  is_validated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_party_id ON public.proposals(party_id);
CREATE INDEX idx_proposals_validated ON public.proposals(is_validated) WHERE is_validated = true;

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view validated proposals"
  ON public.proposals FOR SELECT
  USING (is_validated = true);

CREATE POLICY "Admins can view all proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert proposals"
  ON public.proposals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update proposals"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete proposals"
  ON public.proposals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- PROPOSAL SOURCES
-- =========================
CREATE TABLE public.proposal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  url text NOT NULL,
  source_document_name text,
  original_excerpt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposal_sources_proposal_id ON public.proposal_sources(proposal_id);

ALTER TABLE public.proposal_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sources of validated proposals"
  ON public.proposal_sources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.proposals p
    WHERE p.id = proposal_sources.proposal_id AND p.is_validated = true
  ));

CREATE POLICY "Admins can view all sources"
  ON public.proposal_sources FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sources"
  ON public.proposal_sources FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sources"
  ON public.proposal_sources FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sources"
  ON public.proposal_sources FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- SEED PARTIES (exactly the 8 already in the app)
-- =========================
INSERT INTO public.parties (existing_party_key, name, acronym, short_neutral_description, official_website, last_verified_date) VALUES
  ('ps',    'Partido Socialista',           'PS',  'Partido português que se identifica com a social-democracia e o europeísmo.', 'https://ps.pt', '2025-05-22'),
  ('psd',   'Partido Social Democrata',     'PSD', 'Partido português que se identifica com o centro-direita, o liberalismo social e o europeísmo.', 'https://www.psd.pt', '2025-05-22'),
  ('chega', 'Chega',                        'CH',  'Partido português fundado em 2019, que se identifica com o conservadorismo e o populismo de direita.', 'https://partidochega.pt', '2025-05-22'),
  ('il',    'Iniciativa Liberal',           'IL',  'Partido português fundado em 2017, que se identifica com o liberalismo clássico.', 'https://iniciativaliberal.pt', '2025-05-22'),
  ('be',    'Bloco de Esquerda',            'BE',  'Partido português fundado em 1999, que se identifica com a esquerda socialista e o ecossocialismo.', 'https://www.bloco.org', '2025-05-22'),
  ('pcp',   'Partido Comunista Português',  'PCP', 'Partido português fundado em 1921, que se identifica com o comunismo e o marxismo-leninismo.', 'https://www.pcp.pt', '2025-05-22'),
  ('pan',   'Pessoas-Animais-Natureza',     'PAN', 'Partido português fundado em 2009, focado em ambientalismo e direitos dos animais.', 'https://www.pan.com.pt', '2025-05-22'),
  ('livre', 'LIVRE',                        'L',   'Partido português fundado em 2014, que se identifica com o ecossocialismo e o progressismo europeísta.', 'https://partidolivre.pt', '2025-05-22');

-- =========================
-- SEED PROPOSALS (sourced, neutral, validated)
-- All linked to the official programme/site of each party.
-- =========================

-- PS
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Habitação', 'Reforço da habitação pública e apoio ao arrendamento',
  'Programa eleitoral propõe aumentar a oferta de habitação pública e medidas de apoio ao arrendamento acessível.',
  'https://ps.pt/programa-eleitoral/', 'Programa Eleitoral PS - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'ps';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Saúde', 'Reforço do Serviço Nacional de Saúde',
  'Programa eleitoral propõe contratação de profissionais de saúde e medidas para reduzir tempos de espera no SNS.',
  'https://ps.pt/programa-eleitoral/', 'Programa Eleitoral PS - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'ps';

-- PSD
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Fiscalidade', 'Redução do IRS e do IRC',
  'Programa eleitoral da AD/PSD propõe a redução de escalões e taxas de IRS e a descida progressiva da taxa de IRC.',
  'https://www.psd.pt/programa-eleitoral/', 'Programa Eleitoral AD/PSD - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'psd';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Habitação', 'Isenção de IMT para jovens até 35 anos',
  'Programa eleitoral propõe isenção de IMT e Imposto do Selo na compra de primeira habitação para jovens até aos 35 anos.',
  'https://www.psd.pt/programa-eleitoral/', 'Programa Eleitoral AD/PSD - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'psd';

-- Chega
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Justiça', 'Agravamento de penas para crimes de corrupção',
  'Programa eleitoral propõe o agravamento das molduras penais previstas para crimes de corrupção e criminalidade económico-financeira.',
  'https://partidochega.pt/programa-politico/', 'Programa Político Chega - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'chega';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Segurança', 'Reforço de meios das forças de segurança',
  'Programa eleitoral propõe aumento de efetivos e meios materiais para a PSP e a GNR.',
  'https://partidochega.pt/programa-politico/', 'Programa Político Chega - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'chega';

-- IL
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Fiscalidade', 'IRS com taxa única (flat tax)',
  'Programa eleitoral propõe a substituição dos escalões de IRS por uma taxa única de 15%, com mínimo de existência alargado.',
  'https://iniciativaliberal.pt/programa-eleitoral/', 'Programa Eleitoral IL - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'il';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Educação', 'Liberdade de escolha de escola através de cheque-ensino',
  'Programa eleitoral propõe a implementação de um cheque-ensino que permita às famílias escolher livremente entre escolas públicas e privadas.',
  'https://iniciativaliberal.pt/programa-eleitoral/', 'Programa Eleitoral IL - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'il';

-- BE
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Habitação', 'Controlo de rendas e fim dos Vistos Gold habitacionais',
  'Programa eleitoral propõe limites à atualização de rendas e o fim de incentivos fiscais a investimento estrangeiro em habitação.',
  'https://www.bloco.org/programa', 'Programa Eleitoral BE - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'be';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Trabalho', 'Aumento do salário mínimo nacional',
  'Programa eleitoral propõe o aumento progressivo do salário mínimo nacional acima da inflação.',
  'https://www.bloco.org/programa', 'Programa Eleitoral BE - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'be';

-- PCP
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Trabalho', 'Aumento geral de salários e reposição de direitos laborais',
  'Programa eleitoral propõe aumentos salariais transversais e a reposição de direitos previstos no Código do Trabalho antes das alterações de 2012.',
  'https://www.pcp.pt/programa-eleitoral', 'Programa Eleitoral PCP - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'pcp';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Economia', 'Controlo público de setores estratégicos',
  'Programa eleitoral propõe o reforço do controlo público em setores como energia, comunicações, transportes e banca.',
  'https://www.pcp.pt/programa-eleitoral', 'Programa Eleitoral PCP - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'pcp';

-- PAN
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Ambiente', 'Aceleração da transição energética',
  'Programa eleitoral propõe metas mais ambiciosas para energias renováveis e redução de emissões de gases com efeito de estufa.',
  'https://www.pan.com.pt/programa-eleitoral/', 'Programa Eleitoral PAN - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'pan';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Direitos dos Animais', 'Reforço da legislação de proteção animal',
  'Programa eleitoral propõe alargar a proteção legal aos animais e o fim de práticas que envolvem sofrimento animal em espetáculos.',
  'https://www.pan.com.pt/programa-eleitoral/', 'Programa Eleitoral PAN - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'pan';

-- LIVRE
INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Trabalho', 'Semana de trabalho de 4 dias',
  'Programa eleitoral propõe a redução progressiva do horário de trabalho semanal, com projetos-piloto de semana de 4 dias sem perda de rendimento.',
  'https://partidolivre.pt/programa', 'Programa Eleitoral LIVRE - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'livre';

INSERT INTO public.proposals (party_id, category, title, neutral_summary, official_source_url, source_document_name, last_verified_date, is_validated)
SELECT id, 'Ambiente', 'Lei de bases do clima reforçada',
  'Programa eleitoral propõe o reforço da Lei de Bases do Clima e metas vinculativas de neutralidade carbónica antes de 2050.',
  'https://partidolivre.pt/programa', 'Programa Eleitoral LIVRE - Legislativas 2024', '2025-05-22', true
FROM public.parties WHERE existing_party_key = 'livre';
