-- 1) Remove client read access to sensitive Stripe identifiers on profiles.
--    Subscription tier/status/period_end remain readable for the UI.
REVOKE SELECT (stripe_customer_id, stripe_subscription_id) ON public.profiles FROM anon, authenticated;

-- 2) Harden user_roles against privilege escalation by adding explicit
--    restrictive deny policies for any client write. Only service_role
--    (which bypasses RLS) can assign roles.
CREATE POLICY "Deny client inserts on user_roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny client updates on user_roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny client deletes on user_roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);