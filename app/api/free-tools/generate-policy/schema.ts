import { z } from "zod";

export const generatePolicyInputSchema = z.object({
  businessType: z.enum(["ecommerce", "saas", "services", "retail", "edtech"]),
  companyName: z.string().optional(),
  supportEmail: z.string().email(),
  supportHours: z.enum(["24/7", "business", "limited"]),
  refundWindow: z.number().min(0).max(365),
  escalationLevels: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  tone: z.enum(["formal", "friendly", "professional"]),
});

export const generatePolicyOutputSchema = z.object({
  supportPolicy: z.string(),
  refundPolicy: z.string(),
  escalationRules: z.string(),
});

export type GeneratePolicyInput = z.infer<typeof generatePolicyInputSchema>;
export type GeneratePolicyOutput = z.infer<typeof generatePolicyOutputSchema>;
