import { mergeService } from "@/lib/services/merge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { IExternalIds, IPerson } from "@/lib/types/person";
import { generateMergePrompt } from "@/prompts/merge-prompt";

import { google } from "@ai-sdk/google";
import { generateObject, zodSchema } from "ai";

import z from "zod";

export const POST = async (req: Request) => {
  try {
    const { personIds }: { personIds: string[] } = await req.json();

    if (personIds.length < 2) return errorResponse("Persons ID required", 400);

    // Geting persons
    const persons: IPerson[] = getMockPerson(personIds);
    if (!persons || persons.length < 2)
      return errorResponse("Not enough valid person records to merge", 400);

    //   Sorting IDs
    const { primaryId } = mergeService.resolvePrimaryAndOthers(persons);

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

    return successResponse(mergedPerson, "Persons merged successfully");
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
  createdAt: z.string(),
  updatedAt: z.string(),
} satisfies Record<string, z.ZodTypeAny>);

const getMockPerson = (ids: string[]) => {
  return MockData.filter((p) => ids.includes(p.id));
};

const MockData: IPerson[] = [
  {
    id: "001",
    name: "Hrushikesh Kuklare",
    emails: ["hrushi.kuklare@gmail.com"],
    phones: [],
    externalIds: [
      {
        id: "wa_99123",
        provider: "whatsapp",
      },
    ],
    company: "Freelancer",
    title: "Full Stack Dev",
    location: "",
    tags: ["vip", "returning-customer"],
    interests: ["tech", "coding", "ghee products"],
    memories: ["Asks for multilingual nutritional labels frequently"],
    summary: "Returning customer, interested in detailed product info.",
    notes: ["Responds best at night"],
    pastSessionIds: ["wa_sess_21"],
    createdAt: "2025-10-22T09:15:00.000Z",
    updatedAt: "2025-11-11T09:01:00.000Z",
  },
  {
    id: "002",
    name: "H. Kuklare",
    emails: ["kuklare.h@gmail.com"],
    phones: ["+919876543210"],
    externalIds: [
      {
        id: "slk_99123",
        provider: "slack",
      },
    ],
    company: "",
    title: "",
    location: "Maharashtra",
    tags: ["high-ltv"],
    interests: ["premium groceries"],
    memories: ["Frequently buys ghee in bulk"],
    summary: "High-value customer, strong preference for premium food items.",
    notes: ["Requested express shipping multiple times"],
    pastSessionIds: ["slack_sess_11", "slack_sess_12"],
    createdAt: "2025-08-05T11:00:00.000Z",
    updatedAt: "2025-11-09T12:30:00.000Z",
  },
  {
    id: "003",
    name: "Hrushi K",
    emails: [],
    phones: ["+919876543210"],
    externalIds: [
      {
        id: "wa_299123",
        provider: "whatsapp",
      },
    ],
    company: "",
    title: "",
    location: "Pune, India",
    tags: ["lead"],
    interests: ["gaming", "tech"],
    memories: ["Asked about LAN extension setup", "Uses VPN for gaming"],
    summary: "Tech-savvy gamer. Mostly talks about networking issues.",
    notes: ["Prefers WhatsApp over other platforms"],
    pastSessionIds: ["web_sess_01", "web_sess_02"],
    createdAt: "2025-11-01T11:02:00.000Z",
    updatedAt: "2025-11-10T15:20:00.000Z",
  },
];
