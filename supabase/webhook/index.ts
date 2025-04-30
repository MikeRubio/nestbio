import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer to find Supabase user ID
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;

        // Update subscription in database
        await supabase.from('subscriptions').upsert({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          plan: subscription.items.data[0].price.lookup_key || 'premium',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        // Update profile is_premium status
        await supabase
          .from('profiles')
          .update({
            is_premium: subscription.status === 'active',
          })
          .eq('id', userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer to find Supabase user ID
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', subscription.id);

        // Update profile is_premium status
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
          })
          .eq('id', userId);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});