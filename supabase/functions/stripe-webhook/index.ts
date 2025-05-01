import Stripe from "npm:stripe@14.18.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

// Initialize Stripe and Supabase
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Serve the function
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature header");

    const bodyText = await req.text(); 
    const event = await stripe.webhooks.constructEventAsync(
      bodyText,
      signature,
      endpointSecret
    );

    // Handle relevant event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.supabase_user_id;

        if (!userId) throw new Error("No user ID in customer metadata");

        // Update subscriptions table
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            plan: "premium",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        if (subscriptionError) throw subscriptionError;

        // Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: subscription.status === "active",
            subscription_id: subscription.id,
          })
          .eq("id", userId);

        if (profileError) throw profileError;

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.supabase_user_id;

        if (!userId) throw new Error("No user ID in customer metadata");

        // Cancel subscription
        const { error: cancelError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", subscription.id);

        if (cancelError) throw cancelError;

        // Update user profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            subscription_id: null,
          })
          .eq("id", userId);

        if (profileError) throw profileError;

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
