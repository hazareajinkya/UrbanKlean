import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/clients/axios-client";

interface CheckoutOptions {
  planId: "all_in_one" | "lifetime";
  tier: number;
  billingCycle?: "monthly" | "annually" | "lifetime";
  lifetimePrice?: number;
}

interface CreateCheckoutResponse {
  checkoutId: string;
  checkoutUrl: string;
}

export const usePolarCheckout = () => {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const createCheckoutMutation = useMutation({
    mutationFn: async (options: CheckoutOptions) => {
      const { data } = await axiosClient.post<{
        success: boolean;
        message: string;
        data: CreateCheckoutResponse;
      }>("/api/payments/polar/create-checkout", {
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
    // Check authentication
    if (isLoading) {
      return;
    }

    if (!user?.email) {
      const returnUrl = `/pricing?plan=${planId}&tier=${tier}&billingCycle=${billingCycle}`;
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
    if (!tierData?.priceIds.polar) {
      const errorMessage = `Polar Product ID not found for ${planId} tier ${tier}`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Create checkout session
    try {
      const { checkoutUrl } = await createCheckoutMutation.mutateAsync({
        planId,
        tier,
        billingCycle,
        lifetimePrice,
      } as any);

      // Redirect to Polar checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate Polar checkout";
      console.error("Failed to initiate Polar checkout:", error);
      toast.error(errorMessage);
    }
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user?.email,
    isLoading: isLoading || createCheckoutMutation.isPending,
  };
};
