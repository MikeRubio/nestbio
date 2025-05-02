import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('VITE_STRIPE_WEBHOOK_SECRET') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = Deno.env.get('VITE_STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Get customer to find Supabase user ID
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;

        if (!userId) {
          throw new Error('No user ID found in customer metadata');
        }

        console.log('Updating subscription for user:', userId);

        // Update subscription in database
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            plan: 'premium',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Updating profile premium status');

        // Update profile is_premium status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_premium: subscription.status === 'active',
            subscription_id: subscription.id
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        console.log('Successfully processed subscription update');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        console.log('Processing subscription deletion:', subscription.id);

        // Get customer to find Supabase user ID
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabase_user_id;

        if (!userId) {
          throw new Error('No user ID found in customer metadata');
        }

        console.log('Updating subscription status for user:', userId);

        // Update subscription status
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', subscription.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Updating profile premium status');

        // Update profile is_premium status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_premium: false,
            subscription_id: null
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        console.log('Successfully processed subscription deletion');
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});