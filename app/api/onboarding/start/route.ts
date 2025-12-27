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
    const { email, url, onboardingData } = onboardingCompleteSchema.parse(body);
    const response = await backendClient.post("/onboard/start-training", {
      email,
      url,
      ...onboardingData,
    });
    console.log("response: ", response.data);
    return successResponse(
      { estimatedTime: response.data.data.estimatedTime },
      "Onboarding completed successfully"
    );
  } catch (error: any) {
    console.error("Error completing onboarding:", error);

    return serverErrorResponse(error);
  }
}

const onboardingCompleteSchema = z.object({
  email: z.string().email("Invalid email address"),
  url: z.string().url("URL must start with http:// or https://"),
  onboardingData: z.object({
    companyName: z.string(),
    tagline: z.string(),
    oneLineDescription: z.string(),
    industry: z.string(),
    businessType: z.string(),
    description: z.string(),
    toneGuidelines: z.string(),
    primaryColor: z.string(),
    logo: z.string(),
    targetAudience: z.string(),
  }),
});
