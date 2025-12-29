import { waClient } from "@/lib/clients/axios-client";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { AxiosError } from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneId = searchParams.get("phoneId");

    if (!phoneId) {
      return errorResponse("phoneId is required", 400);
    }

    const fields = "display_phone_number,verified_name,status";

    const response = await waClient.get(`/${phoneId}?fields=${fields}`);

    const phoneData = response.data;
    if (!phoneData) {
      return errorResponse("No phone number data found", 404);
    }

    const phoneInfo = {
      status: phoneData.status,
      display_phone_number: phoneData.display_phone_number,
      name: phoneData.verified_name,
    };

    return successResponse(phoneInfo, "Phone info retrieved successfully");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("WhatsApp API error:", error.message);
      console.error("Error response:", error.response?.data);
      return errorResponse(
        error.response?.data?.error?.message || error.message,
        error.response?.status || 400
      );
    }
    console.error("Error retrieving phone info:", error);
    return serverErrorResponse(error);
  }
}
