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
    if (!tierData?.polarProductId) {
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
      });

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

