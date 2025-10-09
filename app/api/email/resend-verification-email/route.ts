import { postmarkClient } from "@/lib/clients/axios-client";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const { signatureId } = await validateRequestBody(req);

    const { data } = await postmarkClient.post(
      `/senders/${signatureId}/resend`
    );

    return successResponse(
      { signatureId },
      "Verification email resend successfully via Postmark."
    );
  } catch (error) {
    console.error("error: ", error);
    if (error instanceof AxiosError) {
      console.warn("error.message: ", error.message);
      console.warn("error.response?.data: ", error.response?.data);
      return errorResponse(error.response?.data.Message || error.message);
    }
    return serverErrorResponse(error);
  }
}

const resendVerificationEmailSchema = z.object({
  signatureId: z.string(),
});

const validateRequestBody = async (request: NextRequest) => {
  try {
    const body = await request.json();
    console.log("body: ", body);
    return resendVerificationEmailSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error("Failed to parse request body");
  }
};
