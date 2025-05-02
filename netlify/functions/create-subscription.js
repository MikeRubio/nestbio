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
    const { priceId } = JSON.parse(event.body || "{}");
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing priceId" }),
      };
    }

    const token = event.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // Get Supabase user
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );
    if (userError || !userData?.user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid user session" }),
      };
    }

    const user = userData.user;

    // Fetch profile to get or create stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch profile" }),
      };
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      customerId = customer.id;

      // Update profile with customerId
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.URL}/dashboard/subscription?canceled=true`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Error creating subscription:", error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
