import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";

const trackOrderSchema = z
  .object({
    wid: z.string().min(1, "Workspace ID is required"),
    orderId: z.string().optional(),
    orderNumber: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
  })
  .refine((data) => data.orderId || data.orderNumber || data.email, {
    message: "At least one of orderId, orderNumber, or email is required",
    path: ["orderId", "orderNumber", "email"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wid, orderId, orderNumber, email } = trackOrderSchema.parse(body);

    const integration = await shopifyService.getActiveShopifyIntegrationByWid({
      wid,
    });
    if (!integration) {
      return errorResponse("Shopify integration not found", 404);
    }

    const result = await shopifyService.trackOrder({
      shop: integration.id,
      orderId,
      orderNumber,
      email,
    });

    return successResponse(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(
        error.errors[0]?.message || "Invalid request data",
        400
      );
    }
    console.error("Error tracking order:", error);
    return errorResponse(error.message || "Failed to track order", 500);
  }
}
