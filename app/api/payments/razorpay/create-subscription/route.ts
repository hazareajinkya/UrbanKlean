import { NextRequest } from "next/server";
import {
  razorpayApi,
  RazorpaySubscriptionCustomData,
} from "@/lib/clients/razorpay";
import { PLANS } from "@/lib/plans";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

import z from "zod";
const createSubscriptionSchema = z.object({
  planId: z.enum(["growth", "scale"]),
  tier: z.number().int().positive(),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createSubscriptionSchema.parse(body);
    const { planId, tier, userId, userEmail } = validatedData;
    console.log("validatedData", validatedData);

    const plan = PLANS[planId];
    if (!plan) {
      return errorResponse(`Plan ${planId} not found`, 400);
    }

    const tierData = plan.tiers.find((t) => t.messages === tier);
    if (!tierData?.razorpayPlanId) {
      return errorResponse(
        `Razorpay Plan ID not found for ${planId} tier ${tier}`,
        400
      );
    }

    const notes: RazorpaySubscriptionCustomData = {
      userId,
      userEmail,
      planId,
      tier: tier.toString(),
      tierId: tierData.id,
    };

    const subscription = await razorpayApi.createSubscription({
      planId: tierData.razorpayPlanId,
      totalCount: 12,
      notes,
    });

    return successResponse({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay subscription:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
