// Create a Stripe Checkout Session for Premium Monthly or Annual
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
    const priceMonthly = Deno.env.get("STRIPE_PRICE_MONTHLY");
    const priceYearly = Deno.env.get("STRIPE_PRICE_YEARLY");
    if (!stripeKey || !priceMonthly || !priceYearly) {
      throw new Error("Stripe secrets not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const price = plan === "yearly" ? priceYearly : priceMonthly;

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

    // Reuse existing Stripe customer if any
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/profile?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id, plan },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    const safeErrors = ["Not authenticated", "Missing Authorization header"];
    const msg = e instanceof Error && safeErrors.includes(e.message)
      ? e.message
      : "Internal error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
