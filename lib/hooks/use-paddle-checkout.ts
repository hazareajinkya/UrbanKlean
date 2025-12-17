import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { initializePaddle, getPaddle } from "@/lib/clients/paddle";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";

interface CheckoutOptions {
  planId: "growth" | "scale";
  tier: number;
}

export const usePaddleCheckout = () => {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

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

    // Check if user already has an active or trialing subscription
    const subscriptionStatus = user.subscription?.status;
    if (subscriptionStatus !== "canceled") {
      toast.error(
        "You already have an active subscription. Please cancel your current subscription before purchasing a new one."
      );
      return;
    }

    // Get plan and tier data
    const plan = PLANS[planId];
    if (!plan) {
      const errorMessage = `Plan ${planId} not found`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const tierData = plan.tiers.find((t) => t.messages === tier);
    if (!tierData?.paddlePriceId) {
      const errorMessage = `Price ID not found for ${planId} tier ${tier}`;
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Initialize Paddle if not already initialized
    let paddle = getPaddle();
    if (!paddle) {
      paddle = await initializePaddle();
      if (!paddle) {
        const errorMessage =
          "Failed to initialize Paddle checkout. Please try again.";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }
    }

    // Open checkout overlay
    try {
      const successUrl = `${window.location.origin}/checkout/success?plan=${planId}&tier=${tier}`;

      paddle.Checkout.open({
        items: [
          {
            priceId: tierData.paddlePriceId,
            quantity: 1,
          },
        ],
        customer: {
          email: user.email,
        },
        customData: {
          userId: user.id,
          userEmail: user.email,
          planId,
          tier: tier.toString(),
          tierId: tierData.id,
        },
        settings: {
          successUrl,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to open Paddle checkout";
      console.error("Failed to open Paddle checkout:", error);
      toast.error(errorMessage);
    }
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user?.email,
    isLoading,
  };
};
