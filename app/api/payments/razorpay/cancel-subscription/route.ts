import { NextRequest } from "next/server";
import { razorpayApi, RazorpaySubscriptionData } from "@/lib/clients/razorpay";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import userService from "@/lib/services/user-service";
import paymentService from "@/lib/services/payment-service";
import { IUserSubscription } from "@/lib/types/user";

import z from "zod";
const cancelSubscriptionSchema = z.object({
  userEmail: z.string().email("Invalid email address"),
  cancelAtCycleEnd: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = cancelSubscriptionSchema.parse(body);
    const { userEmail, cancelAtCycleEnd } = validatedData;

    const user = await userService.getUser(userEmail);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const subscription = user.subscription;
    if (!subscription?.subscriptionId) {
      return errorResponse("No active subscription found", 400);
    }

    if (subscription.status === "canceled") {
      return errorResponse("Subscription is already canceled", 400);
    }

    if (subscription.canceledAt && cancelAtCycleEnd) {
      return errorResponse(
        "Subscription is already scheduled for cancellation",
        400
      );
    }

    let razorpayResponse: any = null;
    try {
      console.log("Canceling Razorpay subscription", {
        subscriptionId: subscription.subscriptionId,
        cancelAtCycleEnd,
        userEmail,
      });
      razorpayResponse = await razorpayApi.cancelSubscription(
        subscription.subscriptionId,
        cancelAtCycleEnd
      );

      try {
        const updatedSubscription = await razorpayApi.getSubscription(
          subscription.subscriptionId
        );

        if (
          !cancelAtCycleEnd &&
          (updatedSubscription.status === "cancelled" ||
            updatedSubscription.status === "completed")
        ) {
          try {
            const subscriptionData =
              updatedSubscription as unknown as RazorpaySubscriptionData;
            if (!subscriptionData.notes?.userEmail) {
              subscriptionData.notes = {
                ...subscriptionData.notes,
                userEmail: userEmail,
              };
            }
            await paymentService.handleRazorpaySubscriptionCancelled(
              subscriptionData
            );
            console.log("Manually processed cancellation successfully");
          } catch (processError) {
            console.error(
              "Error manually processing cancellation:",
              processError
            );
          }
        }
      } catch (verifyError) {
        console.warn(
          "Could not verify subscription status after cancel",
          verifyError
        );
      }
    } catch (razorpayError: any) {
      const errorMessage =
        razorpayError?.error?.description ||
        razorpayError?.message ||
        "Failed to cancel subscription with Razorpay";
      const errorCode = razorpayError?.statusCode || razorpayError?.status;

      console.error("Razorpay API error:", {
        message: errorMessage,
        code: errorCode,
        error: razorpayError,
      });

      if (errorCode === 404) {
        return errorResponse("Subscription not found in Razorpay", 404);
      }
      if (errorCode === 400) {
        return errorResponse(
          errorMessage || "Invalid request to Razorpay",
          400
        );
      }

      return errorResponse(
        `Failed to cancel subscription: ${errorMessage}`,
        500
      );
    }

    if (cancelAtCycleEnd) {
      const actualCancelTime = razorpayResponse?.current_end
        ? new Date(razorpayResponse.current_end * 1000).toISOString()
        : subscription.renewsAt || new Date().toISOString();

      const updatedSubscription: IUserSubscription = {
        ...subscription,
        canceledAt: actualCancelTime,
      };
      await userService.updateUser(userEmail, {
        subscription: updatedSubscription,
      });
    } else {
      const updatedSubscription: IUserSubscription = {
        ...subscription,
        status: "canceled",
        planId: "none",
        tierId: "none",
        razorpayPlanId: "none",
        recurringQuota: 0,
        canceledAt: new Date().toISOString(),
      };
      delete updatedSubscription.nextPaymentAt;
      delete updatedSubscription.renewsAt;

      await userService.updateUser(userEmail, {
        subscription: updatedSubscription,
      });
    }

    return successResponse({
      message: cancelAtCycleEnd
        ? "Subscription will be canceled at the end of the billing cycle"
        : "Subscription canceled immediately",
    });
  } catch (error: any) {
    console.error("Error canceling Razorpay subscription:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
