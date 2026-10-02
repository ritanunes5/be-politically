-- lovable-cron-fallback-reviewed: full-PDF reading must be split into small page batches due to edge CPU limits; idle runs exit immediately
CREATE TABLE public.topics (
  key text PRIMARY KEY,
  name text NOT NULL,
  categories text[] NOT NULL,
  description_hint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read topics" ON public.topics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage topics" ON public.topics FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.topics (key,name,categories,description_hint) VALUES
('housing','Habitação',ARRAY['Habitação'],'habitação, arrendamento, rendas, construção de casas, habitação pública, crédito à habitação, alojamento estudantil'),
('health','Saúde',ARRAY['Saúde'],'SNS, hospitais, centros de saúde, médicos de família, listas de espera, medicamentos, saúde mental'),
('environment','Ambiente',ARRAY['Ambiente'],'clima, energia renovável, emissões, biodiversidade, água, resíduos, floresta, animais'),
('education','Educação',ARRAY['Educação'],'escolas, professores, ensino superior, propinas, ciência, formação'),
('economy','Economia',ARRAY['Economia','Fiscalidade','Trabalho'],'Economia: crescimento, empresas, investimento. Fiscalidade: impostos, IRS, IRC, IVA. Trabalho: salários, salário mínimo, emprego, contratos, horários'),
('security','Segurança',ARRAY['Segurança','Justiça'],'Segurança: polícia, forças de segurança, criminalidade, defesa, imigração e fronteiras. Justiça: tribunais, corrupção, processos, prisões'),
('infrastructure','Infraestruturas',ARRAY['Infraestruturas','Transportes'],'Infraestruturas: obras públicas, aeroporto, digital, redes. Transportes: comboios, ferrovia, metro, autocarros, passes'),
('social','Proteção Social',ARRAY['Proteção Social'],'pensões, reformas, apoios sociais, pobreza, natalidade, deficiência, idosos, cuidadores')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS source_page integer;

ALTER TABLE public.party_source_pages
  ADD COLUMN IF NOT EXISTS next_page integer,
  ADD COLUMN IF NOT EXISTS total_pages integer,
  ADD COLUMN IF NOT EXISTS pass_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_until timestamptz,
  ADD COLUMN IF NOT EXISTS paused_reason text;

SELECT cron.unschedule('update-party-proposals-daily');
SELECT cron.schedule('update-party-proposals', '*/10 * * * *', $$
  SELECT net.http_post(
    url := 'https://vbwodbgrfxhsdlclodrp.supabase.co/functions/v1/update-party-proposals',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 150000) AS request_id;
$$);