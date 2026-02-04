import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../user/use-user";
import axiosClient from "@/lib/clients/axios-client";
import { toast } from "sonner";
import { IUserSubscription } from "@/lib/types/user";
import { userKey } from "../user/use-user";

export type PaymentProvider = "paddle" | "polar" | "razorpay" | null;

export const getPaymentProvider = (
  subscription?: IUserSubscription
): PaymentProvider => {
  if (!subscription) return null;

  // Check for Paddle
  if (subscription.paddlePriceId && subscription.paddlePriceId !== "none") {
    return "paddle";
  }

  // Check for Polar
  if (
    subscription.polarSubscriptionId &&
    subscription.polarSubscriptionId !== "none"
  ) {
    return "polar";
  }

  // Check for Razorpay
  if (subscription.razorpayPlanId && subscription.razorpayPlanId !== "none") {
    return "razorpay";
  }

  return null;
};

interface CreatePortalSessionResponse {
  portalUrl: string;
}

interface CancelSubscriptionResponse {
  message: string;
}

export const useSubscriptionActions = () => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const provider = getPaymentProvider(user?.subscription);

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      console.log("provider", provider);
      if (!user?.email) {
        throw new Error("User email is required");
      }

      if (provider === "paddle") {
        // Paddle uses environment variable for portal URL
        const paddleCustomerPortalUrl =
          process.env.NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL;
        if (!paddleCustomerPortalUrl) {
          throw new Error("Paddle customer portal URL not configured");
        }
        return { portalUrl: paddleCustomerPortalUrl };
      }

      if (provider === "polar") {
        const { data } = await axiosClient.post<{
          success: boolean;
          message: string;
          data: CreatePortalSessionResponse;
        }>("/api/payments/polar/customer-portal", {
          userEmail: user.email,
        });
        return data.data;
      }

      throw new Error(
        "Unsupported payment provider for subscription management"
      );
    },
    onSuccess: (data) => {
      if (data.portalUrl) {
        window.open(data.portalUrl, "_blank");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to open subscription management");
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (cancelAtCycleEnd: boolean = true) => {
      if (!user?.email) {
        throw new Error("User email is required");
      }

      if (provider === "razorpay") {
        const { data } = await axiosClient.post<{
          success: boolean;
          message: string;
          data: CancelSubscriptionResponse;
        }>("/api/payments/razorpay/cancel-subscription", {
          userEmail: user.email,
          cancelAtCycleEnd,
        });
        return data.data;
      }

      if (provider === "polar") {
        const { data } = await axiosClient.post<{
          success: boolean;
          message: string;
          data: CancelSubscriptionResponse;
        }>("/api/payments/polar/cancel-subscription", {
          userEmail: user.email,
          cancelAtCycleEnd,
        });
        return data.data;
      }

      throw new Error(
        "Cancel subscription is only available for Razorpay and Polar"
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subscription canceled successfully");
      // Invalidate user query to refresh subscription status
      if (user?.email) {
        queryClient.invalidateQueries({ queryKey: userKey(user.email) });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const manageSubscription = () => {
    manageSubscriptionMutation.mutate();
  };

  const cancelSubscription = async ({
    cancelAtCycleEnd = true,
  }: {
    cancelAtCycleEnd: boolean;
  }) => {
    await cancelSubscriptionMutation.mutateAsync(cancelAtCycleEnd);
  };

  return {
    provider,
    manageSubscription,
    cancelSubscription,
    isManaging: manageSubscriptionMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
};
