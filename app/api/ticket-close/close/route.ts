import axios from "axios";
import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import { errorResponse, successResponse } from "@/lib/types/api-response";

export const POST = async (req: NextRequest) => {
  try {
    const { aid, sid }: { aid?: string; sid?: string } = await req.json();
    if (!aid || !sid) return errorResponse("Missing required fields: aid, sid", 400);
    await backendClient.post("/ticket-close/close", { aid, sid });
    return successResponse({ aid, sid }, "Ticket closed");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return errorResponse(
        error.response?.data?.message || error.message || "Failed to close ticket",
        error.response?.status || 400,
      );
    }
    return errorResponse("Unexpected error while closing ticket", 500);
  }
};
