import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/clients/axios-client";

interface CheckoutOptions {
  planId: "growth" | "scale";
  tier: number;
}

interface CreateSubscriptionResponse {
  subscriptionId: string;
  shortUrl: string;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

// Load Razorpay script dynamically
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
        userId: user?.id,
        userEmail: user?.email,
      });
      return data.data;
    },
  });

  const initiateCheckout = async ({ planId, tier }: CheckoutOptions) => {
    // Check authentication
    if (isLoading) {
      return;
    }

    if (!user?.email) {
      const returnUrl = `/pricing`;
      router.push(`/auth?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    const subscriptionStatus = user.subscription?.status;
    const hasActiveSubscription =
      subscriptionStatus &&
      subscriptionStatus !== "canceled" &&
      subscriptionStatus !== "past_due";

    if (hasActiveSubscription) {
      toast.error(
        "You already have an active subscription. Please cancel your current subscription before purchasing a new one."
      );
      return;
    }

    // Get plan data
    const plan = PLANS[planId];
    if (!plan) {
      const errorMessage = `Plan ${planId} not found`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const tierData = plan.tiers.find((t) => t.messages === tier);
    if (!tierData?.razorpayPlanId) {
      const errorMessage = `Razorpay Plan ID not found for ${planId} tier ${tier}`;
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

    // create subscription
    try {
      const { subscriptionId } = await createCheckoutMutation.mutateAsync({
        planId,
        tier,
      });

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscriptionId,
        name: "MagicalCX",
        description: `${plan.name} - ${tier / 1000}k messages/month`,
        handler: () => {
          router.push(`/checkout/success?plan=${planId}&tier=${tier}`);
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
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
