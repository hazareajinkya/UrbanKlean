import axios from "axios";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
} from "@/lib/types/api-response";
import { backendClient } from "@/lib/clients/axios-client";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const response = await backendClient.post(`/actions/test`, body);

    return successResponse(response.data.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[api/actions/test] request failed", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      const message =
        error.response?.data?.message || error.message || "Action test failed";
      return errorResponse(message, error.response?.status || 400);
    }

    console.error("[api/actions/test] unexpected error", error);
    return errorResponse("Unexpected error during action test", 500);
  }
};
