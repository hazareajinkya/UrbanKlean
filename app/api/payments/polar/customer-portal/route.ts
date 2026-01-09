import { NextRequest } from "next/server";
import { polarApi } from "@/lib/clients/polar";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import userService from "@/lib/services/user-service";

import z from "zod";
const createPortalSessionSchema = z.object({
  userEmail: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createPortalSessionSchema.parse(body);
    const { userEmail } = validatedData;

    // Get user to find customerId
    const user = await userService.getUser(userEmail);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const subscription = user.subscription;
    if (!subscription?.customerId) {
      return errorResponse("No active subscription found", 400);
    }

    const portalSession = await polarApi.createCustomerPortalSession({
      customerId: subscription.customerId,
    });

    return successResponse({
      portalUrl: portalSession.url,
    });
  } catch (error: any) {
    console.error("Error creating Polar customer portal session:", error);

    if (error.name === "ZodError") {
      return errorResponse("Invalid request data", 400);
    }

    return serverErrorResponse(error);
  }
}

