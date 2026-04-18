// Stripe webhook → updates profile subscription via update_subscription RPC
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !webhookSecret || !serviceRoleKey) {
    return new Response("Server not configured", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400, headers: corsHeaders });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Invalid signature:", err);
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceRoleKey);

  async function syncFromSubscription(sub: Stripe.Subscription) {
    let userId =
      (sub.metadata?.user_id as string | undefined) ??
      undefined;

    // Fallback: look up customer email and find user
    if (!userId) {
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email =
        (customer as Stripe.Customer).email ?? null;
      if (email) {
        const { data } = await admin.auth.admin.listUsers();
        userId = data.users.find((u) => u.email === email)?.id;
      }
    }
    if (!userId) {
      console.error("No user_id resolved for subscription", sub.id);
      return;
    }

    const isActive = ["active", "trialing"].includes(sub.status);
    await admin.rpc("update_subscription", {
      p_user_id: userId,
      p_subscription_tier: isActive ? "premium" : "free",
      p_subscription_status: sub.status,
      p_stripe_customer_id: sub.customer as string,
      p_stripe_subscription_id: sub.id,
      p_subscription_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          if (!sub.metadata?.user_id && session.client_reference_id) {
            sub.metadata = { ...(sub.metadata ?? {}), user_id: session.client_reference_id };
          }
          await syncFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("webhook handler error:", e);
    return new Response("Handler error", { status: 500, headers: corsHeaders });
  }
});
