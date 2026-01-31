import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIp } from "@/lib/utils";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import {
  generatePolicyInputSchema,
  generatePolicyOutputSchema,
  GeneratePolicyInput,
} from "./schema";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const policyPrompt = (input: GeneratePolicyInput) => `
You are an expert customer support operations consultant. Create comprehensive support documentation for a company with the following profile:

Company Profile:
- Business Type: ${input.businessType}
- Company Name: ${input.companyName || "[Company Name]"}
- Support Email: ${input.supportEmail || "[support@company.com]"}
- Support Availability: ${input.supportHours}
- Refund Window: ${input.refundWindow} days
- Escalation Structure: ${input.escalationLevels} levels
- Brand Tone: ${input.tone}

Generate three distinct policy documents:
1. CUSTOMER SUPPORT POLICY: Define availability, channels, and response time expectations (SLAs) appropriate for the business type and hours. Include the support email as the primary contact method.
2. REFUND POLICY: Create clear, fair, and legally sound refund terms based on the window and business type. Include exceptions and process. Include the support email for refund requests.
3. ESCALATION RULES: Define detailed triggers and handling for ${input.escalationLevels} tiers of support.

The content should be professional, formatted clearly with bullet points where appropriate, and directly usable. Make sure to include the support email (${input.supportEmail || "[support@company.com]"}) prominently in the contact sections.

IMPORTANT: Return ONLY the raw JSON object. Do not wrap it in a schema definition (like "type": "object" or "properties"). Just return the keys: supportPolicy, refundPolicy, escalationRules.
`;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimitResult = await ratelimit.limit(ip || "unknown");

    if (!rateLimitResult.success) {
      return errorResponse(
        "Too many requests. Please wait a moment before trying again.",
        429,
      );
    }

    const body = await req.json();
    const validationResult = generatePolicyInputSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || "Invalid input",
        400,
      );
    }

    const input = validationResult.data;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      mode: "json",
      schema: generatePolicyOutputSchema,
      prompt: policyPrompt(input),
    });

    return successResponse(result.object, "Policy generated successfully");
  } catch (error: any) {
    console.error("Error generating policy:", error);
    return serverErrorResponse(error);
  }
}
