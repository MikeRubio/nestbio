import Stripe from "npm:stripe@14.18.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("VITE_STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing Stripe signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text(); // must be raw, unparsed

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get("VITE_STRIPE_WEBHOOK_SECRET") || ""
    );
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

   // Handle the event
   switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = (subscription.customer as string);
      
      // Get customer to find user ID
      const customer = await stripe.customers.retrieve(customerId);
      const userId = customer.metadata?.supabase_user_id;
      
      if (!userId) {
        throw new Error("No user ID found in customer metadata");
      }

      // Update subscription in database
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .upsert({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          plan: "premium",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

      if (subscriptionError) throw subscriptionError;

      // Update user profile
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
      const customerId = subscription.customer;
      
      // Get customer to find user ID
      const customer = await stripe.customers.retrieve(customerId);
      const userId = customer.metadata?.supabase_user_id;
      
      if (!userId) {
        throw new Error("No user ID found in customer metadata");
      }

      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("id", subscription.id);

      if (subscriptionError) throw subscriptionError;

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
});
