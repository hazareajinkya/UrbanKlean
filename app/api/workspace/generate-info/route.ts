import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import { successResponse, errorResponse } from "@/lib/types/api-response";

export async function POST(request: NextRequest) {
  try {
    const { wid, url } = await request.json();

    const { data } = await backendClient.post("/workspace/generate-info", {
      wid,
      url,
    });

    return successResponse(data);
  } catch (error: any) {
    console.error("[generate-info] Error:", error?.response?.data || error);
    return errorResponse(
      error?.response?.data?.message || "Failed to generate info",
      error?.response?.status || 500
    );
  }
}
