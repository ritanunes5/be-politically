// Check current subscription state in Stripe and sync to profiles via update_subscription RPC
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeKey || !serviceRoleKey) throw new Error("Server not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey,
    );

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (!customers.data.length) {
      await adminClient.rpc("update_subscription", {
        p_user_id: user.id,
        p_subscription_tier: "free",
        p_subscription_status: null,
      });
      return new Response(
        JSON.stringify({ tier: "free", status: null, period_end: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const customer = customers.data[0];
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 1,
    });
    const sub = subs.data[0];
    const isActive = sub && ["active", "trialing"].includes(sub.status);

    await adminClient.rpc("update_subscription", {
      p_user_id: user.id,
      p_subscription_tier: isActive ? "premium" : "free",
      p_subscription_status: sub?.status ?? null,
      p_stripe_customer_id: customer.id,
      p_stripe_subscription_id: sub?.id ?? null,
      p_subscription_period_end: sub?.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    });

    return new Response(
      JSON.stringify({
        tier: isActive ? "premium" : "free",
        status: sub?.status ?? null,
        period_end: sub?.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("check-subscription error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
