import { useRouter } from "next/navigation";
import { useCurrentUser } from "./user/use-user";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/clients/axios-client";
import type {
  RazorpayOptions,
  RazorpayResponse,
} from "@/lib/types/razorpay";

interface CreateCreditOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
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

export const useRazorpayCreditCheckout = () => {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const createOrderMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const { data } = await axiosClient.post<{
        success: boolean;
        message: string;
        data: CreateCreditOrderResponse;
      }>("/api/payments/razorpay/create-credit-order", {
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

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      const errorMessage = "Failed to load Razorpay. Please try again.";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Create order
    try {
      const { orderId } = await createOrderMutation.mutateAsync(quantity);

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        order_id: orderId,
        name: "MagicalCX",
        description: `${quantity * 1000} message credits`,
        handler: () => {
          router.push(
            `/checkout/success?type=credits&quantity=${quantity}`,
          );
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          userId: user.id,
          userEmail: user.email,
          quantity: quantity.toString(),
          type: "credit_purchase",
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
          : "Failed to initiate Razorpay credit checkout";
      console.error("Failed to initiate Razorpay credit checkout:", error);
      toast.error(errorMessage);
    }
  };

  return {
    initiateCheckout,
    isAuthenticated: !!user?.email,
    isLoading: createOrderMutation.isPending,
  };
};
