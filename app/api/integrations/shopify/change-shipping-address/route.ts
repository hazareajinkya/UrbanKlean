import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";

const shippingAddressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  provinceCode: z.string().optional(),
  countryCode: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const changeShippingAddressSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  shippingAddress: shippingAddressSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wid, orderId, shippingAddress } =
      changeShippingAddressSchema.parse(body);

    const integration = await shopifyService.getActiveShopifyIntegrationByWid({
      wid,
    });
    if (!integration) {
      return errorResponse("Shopify integration not found", 404);
    }

    const result = await shopifyService.changeShippingAddress({
      shop: integration.id,
      orderId,
      shippingAddress,
    });

    return successResponse(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(
        error.errors[0]?.message || "Invalid request data",
        400
      );
    }
    console.error("Error changing shipping address:", error);
    return errorResponse(
      error.message || "Failed to change shipping address",
      500
    );
  }
}
