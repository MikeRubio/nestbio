import express from "npm:express@4.18.2";
import Stripe from "npm:stripe@14.18.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const app = express();

// Parse raw body for Stripe webhook
app.use((req, res, next) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    req.rawBody = data;
    next();
  });
});

app.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      endpointSecret
    );

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
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

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.listen(8000);