import { postmarkClient } from "@/lib/clients/axios-client";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const { email, displayName } = await validateRequestBody(req);

    // Prepare payload for Postmark API
    const postmarkPayload = {
      FromEmail: email,
      Name: displayName,
    };

    const { data } = await postmarkClient.post("/senders", postmarkPayload);

    const response = {
      confirmed: data.Confirmed,
      displayName: data.Name,
      domain: data.Domain,
      fromEmail: data.FromEmail,
      replyToEmail: data.ReplyToEmail,
      returnPathDomain: data.ReturnPathDomain,
      signatureId: data.ID,
    };

    return successResponse(response, "Verification email sent via Postmark.");
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

const sendVerificationEmailSchema = z.object({
  email: z.email(),
  displayName: z.string(),
});

const validateRequestBody = async (request: NextRequest) => {
  try {
    const body = await request.json();
    console.log("body: ", body);

    return sendVerificationEmailSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error("Failed to parse request body");
  }
};
