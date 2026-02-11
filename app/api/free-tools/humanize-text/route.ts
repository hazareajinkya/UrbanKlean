import { NextRequest } from "next/server";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIp } from "@/lib/utils";
import { errorResponse, serverErrorResponse } from "@/lib/types/api-response";
import {
  humanizeTextInputSchema,
  HumanizeStyle,
  HumanizeSettings,
} from "./schema";
import { google } from "@ai-sdk/google";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const styleGuide: Record<HumanizeStyle, string> = {
  general: "clear, natural, everyday language",
  academic: "formal, precise but human-readable",
  blog: "reader-friendly, flowing, varied rhythm",
  formal: "polished, structured, professional",
  informal: "casual, relaxed, conversational",
  friendly: "warm, supportive, approachable",
  engaging: "high-energy, vivid, compelling",
};

const settingLabels: Record<keyof HumanizeSettings, string> = {
  removeHiddenUnicode: "Remove hidden unicode",
  transformSmartQuotes: "Smart quotes to plain quotes",
  normalizeDash: "Normalize dashes",
  normalizeEllipsis: "Normalize ellipsis",
  keyboardCharactersOnly: "Keyboard characters only",
  removePersistentWhitespace: "Remove extra whitespace",
  preserveHeadings: "Preserve headings",
};

const getActiveSettings = (settings: HumanizeSettings) =>
  (Object.entries(settings) as [keyof HumanizeSettings, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => settingLabels[k])
    .join(", ");

const humanizePrompt = (args: {
  text: string;
  style: HumanizeStyle;
  settings: HumanizeSettings;
}) => {
  const activeSettings = getActiveSettings(args.settings);
  return `Rewrite this AI-generated text into natural human writing.

Style: ${args.style} — ${styleGuide[args.style]}
${activeSettings ? `Clean: ${activeSettings}` : ""}

"""
${args.text}
"""

Rules:
- Preserve meaning, facts, language, and formatting (paragraphs, line breaks, lists).
- Vary sentence length. Let sentences build on each other naturally.
- Use a direct human voice — like explaining to a colleague. Not forced-casual.
- Use specific details from the source; no vague generalizations or added claims.

Banned AI patterns:
- Structures: "It's not X, it's Y", "In today's world,", "As businesses navigate,", "With the rise of,"
- Phrases: "testament to", "plays a vital role", "rich cultural heritage", "it's important to note", "let's dive in", "game-changer", "unlock", "leverage", "future-proof", "moreover", "furthermore"
- Words (use sparingly): robust, seamless, innovative, cutting-edge, elevate, harness, streamline, crucial, delve, foster, empower
- No excessive colons, em dashes, bold-title bullets, or formatting tricks.

Return only the rewritten text. No JSON, markdown, labels, or explanations.`;
};

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
    const validationResult = humanizeTextInputSchema.safeParse({
      ...body,
      text: body.text || body.prompt,
    });
    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || "Invalid input",
        400,
      );
    }

    const { text, style, settings } = validationResult.data;
    const result = streamText({
      // model: google("gemini-2.5-flash"),
      model: "openai/gpt-oss-120b",
      prompt: humanizePrompt({ text, style, settings }),
    });
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error humanizing text:", error);
    return serverErrorResponse(error);
  }
}
