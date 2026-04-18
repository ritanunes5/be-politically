
-- 1. Replace the permissive UPDATE policy on profiles with a restrictive one
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND subscription_tier IS NOT DISTINCT FROM (SELECT p.subscription_tier FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_period_end IS NOT DISTINCT FROM (SELECT p.subscription_period_end FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. Safe RPC for users to update display_name / avatar_url
CREATE OR REPLACE FUNCTION public.update_profile_safe(
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.update_profile_safe(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_profile_safe(text, text) TO authenticated;

-- 3. Backend-only RPC for Stripe webhooks to update subscription data
CREATE OR REPLACE FUNCTION public.update_subscription(
  p_user_id uuid,
  p_subscription_tier subscription_tier,
  p_subscription_status subscription_status DEFAULT NULL,
  p_stripe_customer_id text DEFAULT NULL,
  p_stripe_subscription_id text DEFAULT NULL,
  p_subscription_period_end timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    subscription_tier = p_subscription_tier,
    subscription_status = COALESCE(p_subscription_status, subscription_status),
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    subscription_period_end = COALESCE(p_subscription_period_end, subscription_period_end),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Restrict to service_role only (used by Stripe webhook edge functions)
REVOKE ALL ON FUNCTION public.update_subscription(uuid, subscription_tier, subscription_status, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription(uuid, subscription_tier, subscription_status, text, text, timestamptz) TO service_role;

-- 4. Lock down usage_tracking — drop direct INSERT policy and replace with RPC
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_tracking;

CREATE OR REPLACE FUNCTION public.record_usage(p_action_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_action_type NOT IN ('comparison', 'ai_topic', 'ai_compare') THEN
    RAISE EXCEPTION 'Invalid action_type: %', p_action_type;
  END IF;

  INSERT INTO public.usage_tracking (user_id, action_type, used_at)
  VALUES (auth.uid(), p_action_type, now());
END;
$$;

REVOKE ALL ON FUNCTION public.record_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_usage(text) TO authenticated;
