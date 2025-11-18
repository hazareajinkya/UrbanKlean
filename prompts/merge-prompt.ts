import { IPerson } from "@/lib/types/person";

export const generateMergePrompt = (persons: IPerson[]) => {
  return `
    You are a deterministic data-merging engine.
    Given an array persons (multiple platform profiles) produce a single merged person object that conforms to the provided schema.
      Rules (strict):
      - Combine emails, phones, tags, interests, notes, memories, pastSessionIds, and externalIds (merge keys), removing duplicates.
      - externalIds is a dictionary of platform id. Merge keys, keep all.
      - Choose the most complete name (longest non-empty). If all empty, use empty string.
      - For company/title/location pick the most specific non-empty value. If conflicting, prefer the profile with the most non-empty fields.
      - summary: create a short 1-2 sentence combined summary.
      - Return JSON strictly matching the provided Zod schema with no extra fields.
      persons:
        ${JSON.stringify(persons)}
      `;
};
