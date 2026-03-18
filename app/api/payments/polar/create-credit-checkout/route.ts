import { NextRequest } from "next/server";
import { polarApi, PolarCreditPurchaseCustomData } from "@/lib/clients/polar";
import { CREDIT_ADDON } from "@/lib/plans";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

import z from "zod";
const createCreditCheckoutSchema = z.object({
  quantity: z.number().int().positive().min(1),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createCreditCheckoutSchema.parse(body);
    const { quantity, userId, userEmail } = validatedData;

    if (!CREDIT_ADDON.productId.polar) {
      return errorResponse(
        "Polar product ID not configured for credit add-on",
        500,
      );
    }

    const metadata: PolarCreditPurchaseCustomData = {
      userId,
      userEmail,
      quantity,
      type: "credit_purchase",
    };

    const successUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/checkout/success?type=credits&quantity=${quantity}`;

    const checkout = await polarApi.createCreditCheckout({
      productId: CREDIT_ADDON.productId.polar,
      quantity,
      customerEmail: userEmail,
      successUrl,
      metadata,
    });

    return successResponse({
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    });
  } catch (error: any) {
    console.error("Error creating Polar credit checkout:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
