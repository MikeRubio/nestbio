export interface Subscription {
    id: string;
    user_id: string;
    plan: 'free' | 'premium';
    status: 'active' | 'canceled' | 'past_due';
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export const SUBSCRIPTION_PLANS = {
    free: {
      name: 'Free',
      price: 0,
      features: [
        'Up to 5 links',
        'Basic analytics',
        'Standard templates',
      ],
    },
    premium: {
      name: 'Premium',
      price: 7,
      yearlyPrice: 60,
      features: [
        'Unlimited links',
        'Advanced analytics',
        'Premium templates',
        'Custom domain',
        'Priority support',
      ],
    },
  } as const;