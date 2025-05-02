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

    let subscription;
    let userId;

    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        subscription = stripeEvent.data.object;
        break;

      case "invoice.paid":
        const invoice = stripeEvent.data.object;
        if (!invoice.subscription) {
          throw new Error("Invoice has no subscription");
        }
        subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        );
        break;

      default:
        console.log("Unhandled event type:", stripeEvent.type);
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    const customer = await stripe.customers.retrieve(subscription.customer);
    userId = customer.metadata?.supabase_user_id;
    if (!userId) throw new Error("No user ID found in customer metadata");

    const subscriptionItem = subscription.items?.data?.[0];
    if (!subscriptionItem) throw new Error("No subscription item found");

    const currentPeriodEnd = new Date(
      subscriptionItem.current_period_end * 1000
    );
    const created = new Date(subscription.created * 1000);
    const updated = new Date(subscription.updated * 1000);

    // Handle subscription changes
    if (
      stripeEvent.type === "customer.subscription.created" ||
      stripeEvent.type === "customer.subscription.updated" ||
      stripeEvent.type === "invoice.paid"
    ) {
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

      if (subError)
        throw new Error(`Subscription upsert failed: ${subError.message}`);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_premium: subscription.status === "active",
          subscription_id: subscription.id,
          updated_at: updated.toISOString(),
        })
        .eq("id", userId);

      if (profileError)
        throw new Error(`Profile update failed: ${profileError.message}`);
    }

    // Handle subscription deleted
    if (stripeEvent.type === "customer.subscription.deleted") {
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: updated.toISOString(),
        })
        .eq("id", subscription.id);

      if (subError)
        throw new Error(
          `Subscription cancel update failed: ${subError.message}`
        );

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_id: null,
          updated_at: updated.toISOString(),
        })
        .eq("id", userId);

      if (profileError)
        throw new Error(`Profile downgrade failed: ${profileError.message}`);
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
