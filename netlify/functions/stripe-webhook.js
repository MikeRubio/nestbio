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

    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;

        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.supabase_user_id;

        if (!userId) throw new Error("No user ID found in customer metadata");

        // Validate timestamps
        const subscriptionItem = subscription.items?.data?.[0];
        if (!subscriptionItem) {
          throw new Error("No subscription item found");
        }

        const currentPeriodEndTimestamp =
          subscriptionItem.current_period_end * 1000;

        if (isNaN(currentPeriodEndTimestamp)) {
          throw new Error("Invalid current_period_end timestamp");
        }

        const createdTimestamp = subscription.created * 1000;
        if (isNaN(createdTimestamp)) {
          throw new Error("Invalid created timestamp");
        }

        const updatedTimestamp = subscription.updated * 1000;
        if (isNaN(updatedTimestamp)) {
          throw new Error("Invalid updated timestamp");
        }

        const currentPeriodEnd = new Date(currentPeriodEndTimestamp);
        const created = new Date(createdTimestamp);
        const updated = new Date(updatedTimestamp);

        await supabase.from("subscriptions").upsert({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          plan: "premium",
          current_period_end: currentPeriodEnd.toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: created.toISOString(),
          updated_at: updated.toISOString(),
        });

        await supabase
          .from("profiles")
          .update({
            is_premium: ["active", "trialing"].includes(subscription.status),
            subscription_id: subscription.id,
            updated_at: updated.toISOString(),
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;

        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.supabase_user_id;

        if (!userId) throw new Error("No user ID found in customer metadata");

        // Validate timestamps
        const currentPeriodEndTimestamp =
          subscription.current_period_end * 1000;
        if (isNaN(currentPeriodEndTimestamp)) {
          throw new Error("Invalid current_period_end timestamp");
        }

        const updatedTimestamp =
          (subscription.updated ?? Date.now() / 1000) * 1000;

        if (isNaN(updatedTimestamp)) {
          throw new Error("Invalid updated timestamp");
        }

        const currentPeriodEnd = new Date(currentPeriodEndTimestamp);
        const updated = new Date(updatedTimestamp);

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: updated.toISOString(),
          })
          .eq("id", subscription.id);

        await supabase
          .from("profiles")
          .update({
            is_premium: false,
            subscription_id: null,
            updated_at: updated.toISOString(),
          })
          .eq("id", userId);

        break;
      }
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
        break;
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
