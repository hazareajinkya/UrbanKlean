import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";

const searchProductsSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  searchQuery: z.string().min(1, "Search query is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wid, searchQuery } = searchProductsSchema.parse(body);
    console.log({ body });

    const integration = await shopifyService.getActiveShopifyIntegrationByWid({
      wid,
    });
    if (!integration) {
      return errorResponse("Shopify integration not found", 404);
    }

    const products = await shopifyService.searchShopifyProducts({
      storeId: integration.id,
      searchQuery,
    });

    return successResponse(products);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return errorResponse(
        error.errors[0]?.message || "Invalid request data",
        400
      );
    }
    console.error("Error searching Shopify products:", error);
    return errorResponse(
      error.message || "Failed to search products",
      error.response?.status || 500
    );
  }
}
