-- 1. Restrict column-level SELECT on profiles: hide stripe_customer_id and stripe_subscription_id from clients
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, display_name, avatar_url, subscription_tier, subscription_status, subscription_period_end, created_at, updated_at)
  ON public.profiles TO authenticated;

-- 2. Tighten role scoping on favorites, comparison_history, usage_tracking policies
-- favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- comparison_history
DROP POLICY IF EXISTS "Users can view their own comparison history" ON public.comparison_history;
DROP POLICY IF EXISTS "Users can insert their own comparison history" ON public.comparison_history;
DROP POLICY IF EXISTS "Users can delete their own comparison history" ON public.comparison_history;

CREATE POLICY "Users can view their own comparison history"
  ON public.comparison_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own comparison history"
  ON public.comparison_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comparison history"
  ON public.comparison_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- usage_tracking (SELECT policy was on public; INSERT already on authenticated)
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Also tighten profiles SELECT policy role
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Revoke EXECUTE on SECURITY DEFINER functions from anon (and from authenticated where inappropriate)
-- update_subscription: must only be callable by service_role (used by edge functions)
REVOKE EXECUTE ON FUNCTION public.update_subscription(uuid, public.subscription_tier, public.subscription_status, text, text, timestamptz) FROM PUBLIC, anon, authenticated;

-- Helper / user-facing functions: revoke from anon, keep for authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_profile_safe(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_usage(text) FROM PUBLIC, anon;

-- Trigger-only functions: revoke from anon and authenticated (only triggers/postgres need to call them)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_favorites_limit() FROM PUBLIC, anon, authenticated;