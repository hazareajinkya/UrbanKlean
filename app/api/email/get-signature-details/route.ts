import { postmarkClient } from "@/lib/clients/axios-client";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { AxiosError } from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const signatureId = req.nextUrl.searchParams.get("signatureId");
    if (!signatureId) {
      return errorResponse("Signature ID is required");
    }

    const { data } = await postmarkClient.get(`/senders/${signatureId}`);

    const response = {
      domain: data.Domain,
      emailAddress: data.EmailAddress,
      name: data.Name,
      confirmed: data.Confirmed,
      replyToEmail: data.ReplyToEmailAddress,
      returnPathDomain: data.ReturnPathDomain,
      signatureId: data.ID,
    };

    return successResponse(response, "Signature details fetched successfully.");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.warn("error.message: ", error.message);
      console.warn("error.response?.data: ", error.response?.data);
      return errorResponse(error.response?.data.Message || error.message);
    }
    console.error("error: ", error);
    return serverErrorResponse(error);
  }
}
