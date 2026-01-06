import { mergeService } from "@/lib/services/merge-service";
import peopleService from "@/lib/services/people-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { IExternalIds, IPerson } from "@/lib/types/person";
import { generateMergePrompt } from "@/prompts/merge-prompt";
import { normEmail, normPhone } from "@/lib/utils";

import { google } from "@ai-sdk/google";
import { generateObject, zodSchema } from "ai";

import z from "zod";

export const POST = async (req: Request) => {
  try {
    const { wid, personIds }: { wid: string; personIds: string[] } =
      await req.json();

    if (personIds.length < 2) return errorResponse("Persons ID required", 400);

    // Geting persons
    const persons: IPerson[] = await peopleService.getPersons(wid, personIds);
    if (!persons || persons.length < 2)
      return errorResponse("Not enough valid person records to merge", 400);

    //   Sorting IDs
    const { primaryId, otherIds } =
      mergeService.resolvePrimaryAndOthers(persons);

    const allMergedIds = [primaryId, ...otherIds];

    // Merging using ai
    const merged = await generateObject({
      // model: google("gemini-2.5-flash"),
      model: "openai/gpt-oss-120b",
      schema: MergeLlmPersonSchema,
      prompt: generateMergePrompt(persons),
    });
    const mergedExternalIds: IExternalIds = persons
      .map((p) => p.externalIds)
      .flat();
    const mergedPastSessionIds: { aid: string; sid: string }[] = persons
      .map((p) => p.pastSessionIds)
      .flat();

    // Combine identicalPersonIds from all persons and remove the merged person IDs
    const combinedIdenticalIds = persons
      .map((p) => p.identicalPersonIds || [])
      .flat()
      .filter((id) => !allMergedIds.includes(id)); // Remove IDs of persons being merged

    const ips: string[] = [
      ...new Set(
        persons
          .map((p) => p.ips)
          .flat()
          .filter((ip): ip is string => !!ip)
      ),
    ];

    const mergedPerson: IPerson = {
      id: primaryId,
      pastSessionIds: mergedPastSessionIds,
      externalIds: mergedExternalIds,
      ...merged.object,
      emails: merged.object.emails
        .map((email) => normEmail(email))
        .filter((email): email is string => !!email)
        .map((email) => ({ value: email, verified: false })),
      phones: merged.object.phones
        .map((phone) => normPhone(phone))
        .filter((phone): phone is string => !!phone)
        .map((phone) => ({ value: phone, verified: false })),

      ips: ips,
      identicalPersonIds: combinedIdenticalIds,
      updatedAt: new Date().toISOString(),
    };

    console.log("merged: ", mergedPerson);

    await mergeService.updateMergePerson(
      primaryId,
      otherIds,
      mergedPerson,
      wid
    );

    return successResponse(mergedPerson, "Persons merged successfully.");
  } catch (error: any) {
    return serverErrorResponse(error);
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
  ips: z.array(z.string()).default([]),
  identicalPersonIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
} satisfies Record<string, z.ZodTypeAny>);
