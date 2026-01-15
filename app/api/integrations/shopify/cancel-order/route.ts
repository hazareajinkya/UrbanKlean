import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";

const cancelOrderSchema = z
  .object({
    wid: z.string().min(1, "Workspace ID is required"),
    orderId: z.string().optional(),
    orderNumber: z.string().optional(),
    staffNote: z.string().optional(),
  })
  .refine((data) => data.orderId || data.orderNumber, {
    message: "At least one of orderId or orderNumber is required",
    path: ["orderId", "orderNumber"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, staffNote, wid } =
      cancelOrderSchema.parse(body);

    const integration = await shopifyService.getActiveShopifyIntegrationByWid({
      wid,
    });
    if (!integration) {
      return errorResponse("Shopify integration not found", 404);
    }

    const result = await shopifyService.cancelOrder({
      shop: integration.id,
      orderId,
      orderNumber,
      staffNote,
    });

    if (result.success === false) {
      return errorResponse(result.error, 400);
    }

    return successResponse(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(
        error.errors[0]?.message || "Invalid request data",
        400
      );
    }
    console.error("Error canceling order:", error);
    return errorResponse(error.message || "Failed to cancel order", 500);
  }
}
