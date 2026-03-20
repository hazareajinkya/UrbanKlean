import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import z from "zod";
import { Redis } from "@upstash/redis";
import { getClientIp } from "@/lib/utils";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { WHITELISTED_EMAILS } from "@/lib/constants";

const redis = Redis.fromEnv();
const RATE_LIMIT_WINDOW_SECONDS = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email } = onboardingStartSchema.parse(body);
    let rateLimitKey: string | null = null;

    if (email && !WHITELISTED_EMAILS.includes(email)) {
      const docs = await getDocs(
        query(collection(db, "/workspaces"), where("info.email", "==", email)),
      );
      if (!docs.empty)
        return errorResponse("This email is already registered.", 409);

      const ip = getClientIp(req);
      rateLimitKey = `ratelimit:onboarding:success:${ip}`;
      const current = await redis.get<number>(rateLimitKey);
      if (current && current >= 1)
        return errorResponse(
          "Too many requests. Please wait a minute and try again.",
          429,
        );
    }

    const response = await backendClient.post(
      "/onboard/generate-onboarding-info",
      { url },
    );

    // Only consume rate limit on successful response
    if (rateLimitKey)
      await redis.setex(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS, 1);

    return successResponse(
      { data: response.data.data },
      "Onboarding started successfully",
    );
  } catch (error: any) {
    console.error("Error starting onboarding:", error);
    return serverErrorResponse(error);
  }
}
const onboardingStartSchema = z.object({
  url: z.string().url("URL must start with http:// or https://"),
  email: z.string().email("Email must be a valid email address").optional(),
});
