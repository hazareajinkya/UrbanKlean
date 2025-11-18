import { mergeService } from "@/lib/services/merge-service";
import peopleService from "@/lib/services/people-service";
import { IExternalIds, IPerson } from "@/lib/types/person";
import { generateMergePrompt } from "@/prompts/merge-prompt";

import { google } from "@ai-sdk/google";
import { generateObject, zodSchema } from "ai";

import z from "zod";

export const POST = async (req: Request) => {
  try {
    const { wid, personIds }: { wid: string; personIds: string[] } =
      await req.json();

    if (personIds.length < 2)
      return new Response("Persons ID required", { status: 400 });

    // Geting persons
    const persons: IPerson[] = await peopleService.getPersons(wid, personIds);
    if (!persons || persons.length < 2)
      return new Response("Not enough valid person records to merge", {
        status: 400,
      });

    //   Sorting IDs
    const { primaryId, otherIds } =
      mergeService.resolvePrimaryAndOthers(persons);

    // Merging using ai
    const merged = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: zodSchema(MergeLlmPersonSchema),
      prompt: generateMergePrompt(persons),
    });
    const mergedExternalIds: IExternalIds = persons
      .map((p) => p.externalIds)
      .flat();
    const mergedPastSessionIds: string[] = persons
      .map((p) => p.pastSessionIds)
      .flat();
    const mergedPerson: IPerson = {
      id: primaryId,
      pastSessionIds: mergedPastSessionIds,
      externalIds: mergedExternalIds,
      ...merged.object,
      updatedAt: new Date().toISOString(),
    };

    await mergeService.updateMergePerson(
      primaryId,
      otherIds,
      mergedPerson,
      wid
    );
    return Response.json(mergedPerson);
  } catch (error: any) {
    return new Response(error.message || "Error to train the agent", {
      status: 500,
    });
  }
};
const MergeLlmPersonSchema = z.object({
  name: z.string().optional().default(""),
  emails: z.array(z.string()).default([]),
  phones: z.array(z.string()).default([]),
  company: z.string().optional().default(""),
  title: z.string().optional().default(""),
  location: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  memories: z.array(z.string()).default([]),
  summary: z.string().optional().default(""),
  notes: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
} satisfies Record<string, z.ZodTypeAny>);
