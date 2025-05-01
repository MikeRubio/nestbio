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
      'Up to 10 links',
      'Basic analytics',
      'Standard templates',
      'Basic customization',
      'Community support',
    ],
    limits: {
      links: 10,
      templates: ['minimal-light', 'tropical-breeze'],
      analytics: 'basic',
    },
  },
  premium: {
    name: 'Premium',
    price: 7,
    yearlyPrice: 60,
    features: [
      'Unlimited links',
      'Advanced analytics',
      'All premium templates',
      'Custom domain',
      'Priority support',
      'Remove Nestbio branding',
      'Custom CSS',
    ],
    limits: {
      links: Infinity,
      templates: 'all',
      analytics: 'advanced',
    },
  },
} as const;