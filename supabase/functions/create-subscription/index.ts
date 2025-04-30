import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, customerId } = await req.json();

    // Create or retrieve Stripe customer
    let customer;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      const { data: { user } } = await supabase.auth.getUser(
        req.headers.get('Authorization')?.replace('Bearer ', '') || ''
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Create Stripe customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('Origin')}/dashboard/subscription?success=true`,
      cancel_url: `${req.headers.get('Origin')}/dashboard/subscription?canceled=true`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});