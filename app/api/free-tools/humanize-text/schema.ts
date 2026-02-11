import { z } from "zod";

export const humanizeModeSchema = z.enum(["super-lite", "super-ultra"]);
export const humanizeStyleSchema = z.enum([
  "general",
  "academic",
  "blog",
  "formal",
  "informal",
  "friendly",
  "engaging",
]);
export const humanizeSettingsSchema = z.object({
  removeHiddenUnicode: z.boolean().default(true),
  transformSmartQuotes: z.boolean().default(true),
  normalizeDash: z.boolean().default(true),
  normalizeEllipsis: z.boolean().default(true),
  keyboardCharactersOnly: z.boolean().default(true),
  removePersistentWhitespace: z.boolean().default(true),
  preserveHeadings: z.boolean().default(true),
});
const defaultHumanizeSettings = {
  removeHiddenUnicode: true,
  transformSmartQuotes: true,
  normalizeDash: true,
  normalizeEllipsis: true,
  keyboardCharactersOnly: true,
  removePersistentWhitespace: true,
  preserveHeadings: true,
};

export const humanizeTextInputSchema = z.object({
  mode: humanizeModeSchema.default("super-lite"),
  style: humanizeStyleSchema.default("general"),
  settings: humanizeSettingsSchema.default(defaultHumanizeSettings),
  text: z
    .string()
    .min(20, "Text must be at least 20 characters")
    .max(8000, "Text must be less than 8000 characters"),
});

export const humanizeTextOutputSchema = z.object({
  humanizedText: z.string().min(1),
  edits: z.array(z.string()).max(6),
});

export type HumanizeMode = z.infer<typeof humanizeModeSchema>;
export type HumanizeStyle = z.infer<typeof humanizeStyleSchema>;
export type HumanizeSettings = z.infer<typeof humanizeSettingsSchema>;
export type HumanizeTextInput = z.infer<typeof humanizeTextInputSchema>;
export type HumanizeTextOutput = z.infer<typeof humanizeTextOutputSchema>;
