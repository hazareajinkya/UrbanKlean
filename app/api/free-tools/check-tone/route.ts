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
  checkToneInputSchema,
  checkToneOutputSchema,
  ToneGoal,
} from "./schema";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const toneDescriptions: Record<ToneGoal, string> = {
  friendly:
    "warm, approachable, conversational, uses casual language while remaining helpful",
  professional:
    "formal, polished, business-appropriate, maintains expertise and authority",
  calm: "soothing, reassuring, patient, de-escalating, acknowledges concerns gently",
  firm: "assertive, direct, clear boundaries, confident without being aggressive",
};

const toneAnalysisPrompt = (
  messageText: string,
  toneGoal: ToneGoal,
) => `You are an expert customer experience analyst evaluating a customer support message for tone and empathy. The desired tone is "${toneGoal}" which should be ${toneDescriptions[toneGoal]}.

Message to Evaluate:
"""
${messageText}
"""

Analyze this message and evaluate:

1. **Tone Match** (0-100): How well does the message match the desired "${toneGoal}" tone? Consider word choice, sentence structure, and overall feel.

2. **Emotional Warmth** (0-100): Does the message show genuine care and understanding? Does it make the customer feel valued? Is there appropriate empathy?

3. **Clarity** (0-100): Is the message easy to understand? Is it well-structured? Are next steps or information clear?

4. **Appropriateness** (0-100): Is the language appropriate for customer service? Are there any phrases that could be misinterpreted or cause offense?

5. **Risky Phrases**: Identify any phrases that could:
   - Come across as dismissive, condescending, or cold
   - Create misunderstandings
   - Escalate customer frustration
   - Undermine trust or professionalism
   For each risky phrase, explain why it's problematic and suggest an alternative.

6. **Strengths**: Identify 2-3 positive aspects of the message.

7. **Suggestions**: Provide 3-5 specific, actionable ways to improve the message to better match the "${toneGoal}" tone.

Calculate an overall score as a weighted average: Tone Match (35%), Emotional Warmth (30%), Clarity (20%), Appropriateness (15%).

Be constructive and specific. Help make this message more empathetic and effective.`;

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
    const validationResult = checkToneInputSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || "Invalid input",
        400,
      );
    }

    const { messageText, toneGoal } = validationResult.data;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: checkToneOutputSchema,
      prompt: toneAnalysisPrompt(messageText, toneGoal),
    });

    return successResponse(
      result.object,
      "Tone analysis completed successfully",
    );
  } catch (error: any) {
    console.error("Error analyzing tone:", error);
    return serverErrorResponse(error);
  }
}
