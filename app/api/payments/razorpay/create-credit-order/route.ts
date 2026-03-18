import { NextRequest } from "next/server";
import {
  razorpayApi,
  RazorpayCreditPurchaseCustomData,
} from "@/lib/clients/razorpay";
import { CREDIT_ADDON } from "@/lib/plans";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";

import z from "zod";
const createCreditOrderSchema = z.object({
  quantity: z.number().int().positive().min(1),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createCreditOrderSchema.parse(body);
    const { quantity, userId, userEmail } = validatedData;
    const amountInPaise = quantity * CREDIT_ADDON.price.inr * 100;

    const notes: RazorpayCreditPurchaseCustomData = {
      userId,
      userEmail,
      quantity,
      type: "credit_purchase",
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
  } catch (error: any) {
    console.error("Error creating Razorpay credit order:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}
