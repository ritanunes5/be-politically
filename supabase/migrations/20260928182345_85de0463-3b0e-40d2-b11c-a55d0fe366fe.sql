CREATE EXTENSION IF NOT EXISTS supabase_vault;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'cron_secret') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cron_secret', 'Shared secret for scheduled edge function calls');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_cron_secret(p_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT p_secret IS NOT NULL AND EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'cron_secret' AND decrypted_secret = p_secret
  )
$$;

REVOKE ALL ON FUNCTION public.verify_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;

DROP POLICY IF EXISTS "Users can insert their own comparison history" ON public.comparison_history;
DROP POLICY IF EXISTS "Users can view their own comparison history" ON public.comparison_history;
CREATE POLICY "Premium users can insert their own comparison history" ON public.comparison_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.is_premium(auth.uid()));
CREATE POLICY "Premium users can view their own comparison history" ON public.comparison_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.is_premium(auth.uid()));