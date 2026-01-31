import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIp } from "@/lib/utils";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { gradeResponseInputSchema, gradeResponseOutputSchema } from "./schema";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const gradingPrompt = (responseText: string) => `You are an expert customer support quality analyst evaluating a customer support response. Analyze the following support reply and grade it on four key dimensions: Clarity, Empathy, Resolution Quality, and Brand Tone.

Support Response to Evaluate:
"""
${responseText}
"""

Evaluate this response based on:

1. **Clarity** (0-100): Is the message easy to understand? Does it avoid jargon? Is it well-structured and concise? Does it clearly communicate next steps?

2. **Empathy** (0-100): Does the response acknowledge the customer's feelings? Does it show understanding of their situation? Is the tone warm and human? Does it make the customer feel heard?

3. **Resolution Quality** (0-100): Does it actually solve the customer's problem? Is it actionable? Does it provide clear steps or solutions? Does it anticipate follow-up questions?

4. **Brand Tone** (0-100): Does it match a professional, friendly brand voice? Is it consistent with good customer service standards? Does it build trust?

Provide:
- An overall score (0-100) that's the average of all four categories
- Individual scores and brief feedback for each category
- 3-5 specific, actionable suggestions for improvement
- 2-3 strengths or positive aspects of the response

Be honest but constructive. Help make customer support responses better.`;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimitResult = await ratelimit.limit(ip || "unknown");

    if (!rateLimitResult.success) {
      return errorResponse(
        "Too many requests. Please wait a moment before trying again.",
        429
      );
    }

    const body = await req.json();
    const validationResult = gradeResponseInputSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || "Invalid input",
        400
      );
    }

    const { responseText } = validationResult.data;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: gradeResponseOutputSchema,
      prompt: gradingPrompt(responseText),
    });

    return successResponse(result.object, "Response graded successfully");
  } catch (error: any) {
    console.error("Error grading response:", error);
    return serverErrorResponse(error);
  }
}
