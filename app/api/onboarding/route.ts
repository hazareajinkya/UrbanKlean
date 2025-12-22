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
    const { email, url } = onboardingStartSchema.parse(body);
    const response = await backendClient.post("/onboard/start", {
      email,
      url,
    });
    console.log(response.data.data.estimatedTime);
    return successResponse(
      { estimatedTime: response.data.data?.estimatedTime ?? 0 },
      "Onboarding started successfully"
    );
  } catch (error: any) {
    console.error("Error starting onboarding:", error);

    return serverErrorResponse(error);
  }
}
const onboardingStartSchema = z.object({
  email: z.string().email("Invalid email address"),
  url: z.string().url("URL must start with http:// or https://"),
});
