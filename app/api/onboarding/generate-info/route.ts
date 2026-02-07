import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/types/api-response";
import z from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIp } from "@/lib/utils";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "1 m"),
});

export async function POST(req: NextRequest) {
  try {


    const body = await req.json();
    const { url, email } = onboardingStartSchema.parse(body);


    if (email && email !== "support@magicalcx.com") {
      const docs = await getDocs(
        query(collection(db, "/workspaces"), where("info.email", "==", email))
      );

      if (!docs.empty) {
        return errorResponse("This email is already registered.", 409);
      }
      const ip = getClientIp(req);
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return errorResponse("Too many requests. Please wait a minute and try again.", 429);
      }
    }
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
  email: z.string().email("Email must be a valid email address").optional(),
});
