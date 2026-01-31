import { z } from "zod";

export const toneGoalSchema = z.enum([
  "friendly",
  "professional",
  "calm",
  "firm",
]);
export type ToneGoal = z.infer<typeof toneGoalSchema>;

export const checkToneInputSchema = z.object({
  toneGoal: toneGoalSchema,
  messageText: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
});

export const checkToneOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  toneMatch: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
  }),
  metrics: z.array(
    z.object({
      name: z.enum(["Emotional Warmth", "Clarity", "Appropriateness"]),
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
  ),
  riskyPhrases: z.array(
    z.object({
      phrase: z.string(),
      reason: z.string(),
      suggestion: z.string().optional(),
    }),
  ),
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
});

export type CheckToneInput = z.infer<typeof checkToneInputSchema>;
export type CheckToneOutput = z.infer<typeof checkToneOutputSchema>;
