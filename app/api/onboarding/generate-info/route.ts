import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = onboardingStartSchema.parse(body);
    const response = await backendClient.post(
      "/onboard/generate-onboarding-info",
      {
        url,
      }
    );
    return successResponse(
      { data: response.data.data },
      "Onboarding started successfully"
    );
  } catch (error: any) {
    console.error("Error starting onboarding:", error);

    return serverErrorResponse(error);
  }
}
const onboardingStartSchema = z.object({
  url: z.string().url("URL must start with http:// or https://"),
});
