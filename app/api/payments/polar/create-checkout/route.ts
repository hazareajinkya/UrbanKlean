import { NextRequest } from "next/server";
import { polarApi, PolarSubscriptionCustomData } from "@/lib/clients/polar";
import { PLANS } from "@/lib/plans";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

import z from "zod";
const createCheckoutSchema = z.object({
  planId: z.enum(["growth", "scale", "all_in_one"]),
  tier: z.number().int().positive(),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email address"),
  billingCycle: z.enum(["monthly", "annually"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createCheckoutSchema.parse(body);
    const { planId, tier, userId, userEmail, billingCycle } = validatedData;

    const plan = PLANS[planId];
    if (!plan) {
      return errorResponse(`Plan ${planId} not found`, 400);
    }

    const tierData = plan.tiers.find(
      (t) =>
        t.messages === tier &&
        (!billingCycle || t.billingCycle === billingCycle),
    );
    if (!tierData?.priceIds.polar) {
      return errorResponse(
        `Polar Product ID not found for ${planId} tier ${tier}`,
        400,
      );
    }

    const metadata: PolarSubscriptionCustomData = {
      userId,
      userEmail,
      planId,
      tier: tier.toString(),
      tierId: tierData.id,
    };

    const successUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/checkout/success?plan=${planId}&tier=${tier}`;

    const checkout = await polarApi.createCheckoutSession({
      productId: tierData.priceIds.polar,
      customerEmail: userEmail,
      successUrl,
      metadata,
    });

    return successResponse({
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    });
  } catch (error: any) {
    console.error("Error creating Polar checkout:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
