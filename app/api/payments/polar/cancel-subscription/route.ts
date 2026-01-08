import { NextRequest } from "next/server";
import { polarApi } from "@/lib/clients/polar";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import userService from "@/lib/services/user-service";
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
    if (!subscription?.polarSubscriptionId) {
      return errorResponse("No active Polar subscription found", 400);
    }

    await polarApi.cancelSubscription(
      subscription.polarSubscriptionId,
      cancelAtCycleEnd
    );

    if (cancelAtCycleEnd) {
      const updatedSubscription: IUserSubscription = {
        ...subscription,
        canceledAt: new Date().toISOString(),
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
        polarSubscriptionId: "none",
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
    console.error("Error canceling Polar subscription:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
