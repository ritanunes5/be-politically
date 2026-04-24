-- Server-side enforcement of free-tier quotas

-- 1. Helper: check if current user is premium
CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND subscription_tier = 'premium'
  )
$$;

-- 2. Trigger to enforce favorites limit (5 for free users)
CREATE OR REPLACE FUNCTION public.enforce_favorites_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  IF public.is_premium(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM public.favorites
  WHERE user_id = NEW.user_id;

  IF current_count >= 5 THEN
    RAISE EXCEPTION 'Free tier favorites limit reached (5). Upgrade to Premium for unlimited favorites.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_favorites_limit_trigger ON public.favorites;
CREATE TRIGGER enforce_favorites_limit_trigger
  BEFORE INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_favorites_limit();

-- 3. Update record_usage to enforce comparison quota (3/day for free)
CREATE OR REPLACE FUNCTION public.record_usage(p_action_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_count integer;
  daily_limit integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_action_type NOT IN ('comparison', 'ai_topic', 'ai_compare', 'ai_chat') THEN
    RAISE EXCEPTION 'Invalid action_type: %', p_action_type;
  END IF;

  -- Enforce daily quotas for non-premium users
  IF NOT public.is_premium(auth.uid()) THEN
    daily_limit := CASE p_action_type
      WHEN 'comparison' THEN 3
      WHEN 'ai_chat' THEN 1
      WHEN 'ai_topic' THEN 1
      WHEN 'ai_compare' THEN 1
      ELSE NULL
    END;

    IF daily_limit IS NOT NULL THEN
      SELECT COUNT(*) INTO today_count
      FROM public.usage_tracking
      WHERE user_id = auth.uid()
        AND action_type = p_action_type
        AND used_at >= date_trunc('day', now());

      IF today_count >= daily_limit THEN
        RAISE EXCEPTION 'Free tier daily limit reached for %. Upgrade to Premium for unlimited access.', p_action_type
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.usage_tracking (user_id, action_type, used_at)
  VALUES (auth.uid(), p_action_type, now());
END;
$$;