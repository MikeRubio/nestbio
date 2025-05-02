const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

        await supabase.from("subscriptions").upsert({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          plan: "premium",
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        await supabase
          .from("profiles")
          .update({
            is_premium: subscription.status === "active",
            subscription_id: subscription.id,
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

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", subscription.id);

        await supabase
          .from("profiles")
          .update({
            is_premium: false,
            subscription_id: null,
          })
          .eq("id", userId);

        break;
      }
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
