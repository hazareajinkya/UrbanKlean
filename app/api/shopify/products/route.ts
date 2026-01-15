import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";
import { ShopifyProductsRequest } from "@/lib/types/shopify";

export async function POST(req: NextRequest) {
  try {
    const body: ShopifyProductsRequest = await req.json();
    const { wid, searchQuery } = body;

    if (!wid) {
      return errorResponse("Workspace ID is required", 400);
    }

    if (!searchQuery) {
      return errorResponse("Search query is required", 400);
    }

    const integration = await shopifyService.getActiveShopifyIntegrationByWid({
      wid,
    });

    const products = await shopifyService.searchShopifyProducts({
      wid,
      storeId: integration.id,
      searchQuery,
    });

    return successResponse(products);
  } catch (error: any) {
    console.error("Error searching Shopify products:", error);
    return errorResponse(
      error.message || "Failed to search products",
      error.response?.status || 500
    );
  }
}
