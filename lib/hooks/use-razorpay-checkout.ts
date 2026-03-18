import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/lib/clients/axios-client";
import type { RazorpayOptions, RazorpayResponse } from "@/lib/types/razorpay";
import { razorpayconf } from "../utils/conf";
import datafastService from "@/lib/services/datafast-service";

interface CheckoutOptions {
  planId: "all_in_one" | "lifetime";
  tier: number;
  billingCycle?: "monthly" | "annually" | "lifetime";
  lifetimePrice?: number;
}

interface CreateSubscriptionResponse {
  subscriptionId?: string;
  shortUrl?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpayCheckout = () => {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const createCheckoutMutation = useMutation({
    mutationFn: async (options: CheckoutOptions) => {
      const { data } = await axiosClient.post<{
        success: boolean;
        message: string;
        data: CreateSubscriptionResponse;
      }>("/api/payments/razorpay/create-checkout", {
        planId: options.planId,
        tier: options.tier,
        billingCycle: options.billingCycle,
        lifetimePrice: options.lifetimePrice,
        userId: user?.id,
        userEmail: user?.email,
      });
      return data.data;
    },
  });

  const initiateCheckout = async ({
    planId,
    tier,
    billingCycle,
    lifetimePrice,
  }: CheckoutOptions) => {

    if (isLoading) {
      return;
    }

    if (!user?.email) {
      const returnUrl = `/pricing?plan=${planId}&tier=${tier}&billingCycle=${billingCycle}`;
      datafastService.trackGoal("checkout_auth_redirected", {
        provider: "razorpay",
        plan_id: planId,
      });
      router.push(`/auth?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Check for existing subscription (skip for lifetime if user already has lifetime)
    if (billingCycle !== "lifetime") {
      const subscriptionStatus = user.subscription?.status;
      const hasActiveSubscription =
        subscriptionStatus &&
        subscriptionStatus !== "canceled" &&
        subscriptionStatus !== "past_due";

      if (hasActiveSubscription) {
        toast.error(
          "You already have an active subscription. Please cancel your current subscription before purchasing a new one.",
        );
        return;
      }
    } else {
      // For lifetime, check if user already has lifetime access
      if (user.subscription?.planId === "lifetime") {
        toast.error("You already have lifetime access to MagicalCX.");
        return;
      }
    }

    // Get plan data
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      const errorMessage = `Plan ${planId} not found`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const tierData = plan.tiers.find(
      (t) =>
        t.messages === tier &&
        (!billingCycle || t.billingCycle === billingCycle),
    );

    // For lifetime purchases, we only need the tier data for pricing (uses one-time orders, not subscriptions)
    // For subscriptions, we need a valid Razorpay plan ID
    if (billingCycle !== "lifetime" && !tierData?.priceIds.razorpay) {
      const errorMessage = `Razorpay Plan ID not found for ${planId} tier ${tier}`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!tierData) {
      const errorMessage = `Tier not found for ${planId} tier ${tier}`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      const errorMessage = "Failed to load Razorpay. Please try again.";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Create checkout (subscription or lifetime order)
    try {
      const response = await createCheckoutMutation.mutateAsync({
        planId,
        tier,
        billingCycle,
        lifetimePrice,
      });
      datafastService.trackGoal("checkout_session_created", {
        provider: "razorpay",
        plan_id: planId,
      });

      const { subscriptionId, orderId, amount, currency } = response;

      // Determine description and success URL based on plan type
      const isLifetime = billingCycle === "lifetime";
      const description = isLifetime
        ? `${plan.name} - Lifetime Access`
        : `${plan.name} - ${tier / 1000}k messages/month (14-day trial)`;
      const successUrl = isLifetime
        ? `/checkout/success?type=lifetime`
        : `/checkout/success?plan=${planId}&tier=${tier}&subscriptionId=${subscriptionId}`;

      // Build options: use order_id for lifetime, subscription_id for subscriptions
      const options: RazorpayOptions = {
        key: razorpayconf.keyId!,
        name: "MagicalCX",
        description,
        handler: () => {
          router.push(successUrl);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          userId: user.id,
          userEmail: user.email,
          planId,
          tier: tier.toString(),
          tierId: tierData.id,
          type: isLifetime ? "lifetime_purchase" : "subscription",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },
      };

      // For lifetime: use order_id flow
      // For subscriptions: use subscription_id flow
      if (isLifetime && orderId) {
        options.order_id = orderId;
        options.amount = amount;
        options.currency = currency;
      } else if (subscriptionId) {
        options.subscription_id = subscriptionId;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      datafastService.trackGoal("checkout_session_failed", {
        provider: "razorpay",
        plan_id: planId,
      });
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate Razorpay checkout";
      console.error("Failed to initiate Razorpay checkout:", error);
      toast.error(errorMessage);
    }
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user?.email,
    isLoading: isLoading || createCheckoutMutation.isPending,
  };
};
