import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, AlertCircle } from "lucide-react";
import { useUserStore } from "../../stores/userStore";
import { SUBSCRIPTION_PLANS, Subscription } from "../../types/subscription";
import Button from "../../components/common/Button";
import { supabase } from "../../lib/supabaseClient";

export default function SubscriptionPage() {
  const { profile } = useUserStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", profile?.id)
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (profile) {
      fetchSubscription();
    }
  }, [profile]);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to upgrade your subscription.");
        return;
      }
      const response = await fetch("/.netlify/functions/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId:
            billingCycle === "monthly"
              ? "price_1RJaTzBNpxoXCrO64xrJcksz"
              : "price_1RJaUZBNpxoXCrO6YLtEBaNM",
          customerId: profile?.stripe_customer_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subscription");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("id", subscription?.id);

      if (updateError) throw updateError;

      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscription?.id)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
          Subscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and billing
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-theme text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-theme text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Yearly
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
              Save 28%
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Free</h2>
              <Star className="text-gray-400" size={24} />
            </div>
            <div className="mb-6">
              <p className="text-3xl font-bold mb-2">$0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Forever free
              </p>
            </div>
            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm">
                  <Check size={16} className="mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              fullWidth
              disabled={subscription?.plan === "free"}
            >
              {subscription?.plan === "free" ? "Current Plan" : "Downgrade"}
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card p-6 border-theme"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Premium</h2>
              <Crown className="text-theme" size={24} />
            </div>
            <div className="mb-6">
              <p className="text-3xl font-bold mb-2">
                ${billingCycle === "monthly" ? "7" : "60"}
                <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                  /{billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </p>
              {billingCycle === "yearly" && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Save $24/year
                </p>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_PLANS.premium.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm">
                  <Check size={16} className="mr-2 text-theme" />
                  {feature}
                </li>
              ))}
            </ul>
            {subscription?.plan === "premium" ? (
              <Button variant="outline" fullWidth onClick={handleCancel}>
                {subscription.cancel_at_period_end
                  ? "Canceled - Expires Soon"
                  : "Cancel Subscription"}
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={handleUpgrade}>
                Upgrade to Premium
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {subscription?.plan === "premium" && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Billing Information</h2>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1 flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      subscription.status === "active"
                        ? "bg-green-500"
                        : subscription.status === "past_due"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="capitalize">{subscription.status}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Current Period
                </dt>
                <dd className="mt-1">
                  Ends on{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </dd>
              </div>
              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Your subscription will end on{" "}
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString()}
                    . You can continue using premium features until then.
                  </p>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
