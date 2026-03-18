import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/lib/clients/axios-client";

interface CreateCreditCheckoutResponse {
  checkoutId: string;
  checkoutUrl: string;
}

export const usePolarCreditCheckout = () => {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const createCheckoutMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const { data } = await axiosClient.post<{
        success: boolean;
        message: string;
        data: CreateCreditCheckoutResponse;
      }>("/api/payments/polar/create-credit-checkout", {
        quantity,
        userId: user?.id,
        userEmail: user?.email,
      });
      return data.data;
    },
  });

  const initiateCheckout = async (quantity: number) => {
    // Check authentication
    if (isLoading) {
      return;
    }

    if (!user?.email) {
      const returnUrl = `/pricing`;
      router.push(`/auth?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // Create checkout session
    try {
      const { checkoutUrl } = await createCheckoutMutation.mutateAsync(
        quantity,
      );

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
          : "Failed to initiate Polar credit checkout";
      console.error("Failed to initiate Polar credit checkout:", error);
      toast.error(errorMessage);
    }
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user?.email,
    isLoading: createCheckoutMutation.isPending,
  };
};
