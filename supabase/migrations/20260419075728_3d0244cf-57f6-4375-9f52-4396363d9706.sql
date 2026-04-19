CREATE OR REPLACE FUNCTION public.record_usage(p_action_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_action_type NOT IN ('comparison', 'ai_topic', 'ai_compare', 'ai_chat') THEN
    RAISE EXCEPTION 'Invalid action_type: %', p_action_type;
  END IF;

  INSERT INTO public.usage_tracking (user_id, action_type, used_at)
  VALUES (auth.uid(), p_action_type, now());
END;
$function$;