import { z } from "zod";

export const gradeResponseInputSchema = z.object({
  responseText: z.string().min(10, "Support response must be at least 10 characters").max(5000, "Support response must be less than 5000 characters"),
});

export const gradeResponseOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categories: z.array(
    z.object({
      name: z.enum(["Clarity", "Empathy", "Resolution Quality", "Brand Tone"]),
      score: z.number().min(0).max(100),
      feedback: z.string(),
    })
  ),
  suggestions: z.array(z.string()),
  strengths: z.array(z.string()),
});

export type GradeResponseInput = z.infer<typeof gradeResponseInputSchema>;
export type GradeResponseOutput = z.infer<typeof gradeResponseOutputSchema>;
