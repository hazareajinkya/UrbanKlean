import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import shopifyService from "@/lib/services/shopify-service";
import workspaceService from "@/lib/services/workspace-service";
import { shopifyClient } from "@/lib/clients/axios-client";

// activate Shopify integration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop, accessToken, accessTokenExpiresAt, apiKey } = body;

    if (!shop) {
      return errorResponse("Shop is required", 400);
    }

    if (!accessToken) {
      return errorResponse("Access token is required", 400);
    }

    if (!accessTokenExpiresAt) {
      return errorResponse("Access token expiration date is required", 400);
    }

    const integration = await shopifyService.activateShopifyIntegration({
      shop,
      accessToken,
      accessTokenExpiresAt,
      apiKey,
    });

    const workspace = await workspaceService.fetchWorkspace(integration.wid);

    const refreshedToken = await shopifyService.refreshShopifyToken({
      storeId: shop,
      wid: integration.wid,
    });

    console.log("Refreshed access token:", refreshedToken.accessToken);
    console.log("New expiration:", refreshedToken.accessTokenExpiresAt);

    return successResponse({
      status: "active",
      wid: integration.wid,
      workspaceName: workspace.name,
    });
  } catch (error: unknown) {
    const err = error as Error & { response?: { status?: number } };
    console.error("Error activating Shopify integration:", err);
    return errorResponse(
      err.message || "Failed to activate Shopify integration",
      err.response?.status || 500
    );
  }
}

// disconnect Shopify integration
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop, wid } = body;
    await shopifyService.disconnectShopifyIntegration({
      wid,
      storeId: shop,
    });
    return successResponse("Shopify integration disconnected successfully");
  } catch (error: unknown) {
    const err = error as Error & { response?: { status?: number } };
    console.error("Error disconnecting Shopify integration:", err);
    return errorResponse(
      err.message || "Failed to disconnect Shopify integration",
      err.response?.status || 500
    );
  }
}

// delete Shopify integration
export async function DELETE(req: NextRequest) {
  try {
    const { storeId, wid } = await req.json();
    if (!storeId || !wid) {
      return errorResponse("Store ID and workspace ID are required", 400);
    }

    const res = await shopifyClient.post("/disconnect", {
      shop: storeId,
      wid,
    });

    return successResponse("Shopify integration deleted successfully");
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { status?: number; data?: { message?: string } };
    };
    console.error("Error deleting Shopify integration:", err.message);
    return errorResponse(
      err.response?.data?.message ||
        err.message ||
        "Failed to delete Shopify integration",
      err.response?.status || 500
    );
  }
}
