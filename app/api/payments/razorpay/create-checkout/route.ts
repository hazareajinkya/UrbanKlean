import { NextRequest } from "next/server";
import {
  razorpayApi,
  RazorpaySubscriptionCustomData,
  RazorpayLifetimePurchaseCustomData,
} from "@/lib/clients/razorpay";
import { PLANS } from "@/lib/plans";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

import z from "zod";
const createSubscriptionSchema = z.object({
  planId: z.enum(["growth", "scale", "all_in_one", "lifetime"]),
  tier: z.number().int().positive(),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email address"),
  billingCycle: z.enum(["monthly", "annually", "lifetime"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createSubscriptionSchema.parse(body);
    const { planId, tier, userId, userEmail, billingCycle } = validatedData;
    console.log("validatedData", validatedData);

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return errorResponse(`Plan ${planId} not found`, 400);
    }

    // Handle lifetime plan - create order only (no subscription)
    if (billingCycle === "lifetime") {
      const tierData = plan.tiers[0];
      if (!tierData) {
        return errorResponse("Tier not found for lifetime plan", 400);
      }

      const amountInPaise = tierData.price.inr * 100;

      const notes: RazorpayLifetimePurchaseCustomData = {
        userId,
        userEmail,
        type: "lifetime_purchase",
        planId,
      };

      const order = await razorpayApi.createOrder({
        amount: amountInPaise,
        currency: "INR",
        notes,
      });

      return successResponse({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    }

    const tierData = plan.tiers.find(
      (t) =>
        t.messages === tier &&
        (!billingCycle || t.billingCycle === billingCycle),
    );
    if (!tierData?.priceIds.razorpay) {
      return errorResponse(
        `Razorpay Plan ID not found for ${planId} tier ${tier}`,
        400,
      );
    }

    const notes: RazorpaySubscriptionCustomData = {
      userId,
      userEmail,
      planId,
      tier: tier.toString(),
      tierId: tierData.id,
    };


    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    const startAt = Math.floor(trialEndDate.getTime() / 1000);

    const subscription = await razorpayApi.createSubscription({
      planId: tierData.priceIds.razorpay,
      totalCount: 12,
      notes,
      startAt,
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
