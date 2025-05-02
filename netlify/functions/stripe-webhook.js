const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const signature = event.headers["stripe-signature"];
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const subscription = stripeEvent.data.object;

    // Skip incomplete subscriptions
    if (subscription.status === "incomplete") {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true, reason: "incomplete status" }),
      };
    }

    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.supabase_user_id;

    if (!userId) throw new Error("No user ID found in customer metadata");

    const subscriptionItem = subscription.items?.data?.[0];
    if (!subscriptionItem) throw new Error("No subscription item found");

    const currentPeriodEnd = new Date(
      subscriptionItem.current_period_end * 1000
    );
    const created = new Date(subscription.created * 1000);
    const updated = new Date(subscription.updated * 1000);

    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const { error: subError } = await supabase.from("subscriptions").upsert(
          {
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            plan: "premium",
            current_period_end: currentPeriodEnd.toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            created_at: created.toISOString(),
            updated_at: updated.toISOString(),
          },
          { onConflict: "id" }
        );

        if (subError) {
          console.error("Upsert subscriptions failed:", subError.message);
          throw new Error("Subscription upsert failed");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: subscription.status === "active",
            subscription_id: subscription.id,
            updated_at: updated.toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("Update profile failed:", profileError.message);
          throw new Error("Profile update failed");
        }

        break;
      }

      case "customer.subscription.deleted": {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: updated.toISOString(),
          })
          .eq("id", subscription.id);

        if (subError) {
          console.error("Update subscription failed:", subError.message);
          throw new Error("Subscription cancel update failed");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            subscription_id: null,
            updated_at: updated.toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("Update profile failed:", profileError.message);
          throw new Error("Profile downgrade failed");
        }

        break;
      }

      default:
        console.log("Unhandled event type:", stripeEvent.type);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Webhook error:", error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
