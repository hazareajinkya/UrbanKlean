import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/types/api-response";
import { getClientIp } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    console.log("ip: ", ip);
    return successResponse({ ip }, "Client IP retrieved successfully");
  } catch (error: any) {
    console.error("Error retrieving client IP:", error);
    return errorResponse("Failed to retrieve client IP", 500);
  }
}
