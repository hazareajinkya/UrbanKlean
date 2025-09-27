import { tool } from "ai";
import { z } from "zod";
import peopleService from "../services/people-service";

const PersonInfo = z.object({
  personId: z.string().optional().describe("Get it from context personId "),
  channel: z
    .enum(["web", "whatsapp", "instagram", "email", "voice", "other"])
    .optional(),

  // Core identity (any subset is fine)
  name: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(), // E.164 preferred
  externalIds: z.record(z.string(), z.string()).optional(), // e.g., { waId: "...", igId: "...", shopifyCustomerId: "..." }

  // Durable info (store on the same person doc)
  company: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),

  // Memory-like fields (simple but effective)
  interests: z.array(z.string()).optional(), // ["fitness","discounts","shipping-updates"]
  preferences: z.record(z.string(), z.string()).optional(), // { "language":"en", "currency":"INR" }
  attributes: z.record(z.string(), z.any()).optional(), // free-form KV for anything else

  // Light CRM-ish bits kept on the same doc to keep it simple
  tags: z.array(z.string()).optional(), // ["pricing","shopify","hot"]
  notes: z.string().optional(),
});

export const collectInformation = (wid: string) =>
  tool({
    name: "Collect Information",
    description:
      "Always include the user's name and email when calling this tool, asking for them politely if missing. " +
      "Upsert a single person object (identity + interests + preferences + tags/notes) into Firestore. Use whenever the user shares durable info worth remembering.",
    inputSchema: PersonInfo,

    execute: async (params) => {
      console.log("collecting information: ", params);

      let personId = params.personId;
      if (!personId) {
        const result = await peopleService.identifyPerson({
          wid: wid,
          email: params.email,
          phone: params.phone,
          name: params.name,
          externalIds: params.externalIds,
        });

        console.log("personId: ", result.personId);
        console.log("existing: ", result.existing);
        console.log("data: ", params);
        personId = result.personId;
      }

      const update = await peopleService.updatePerson(
        wid,
        personId,
        params as Partial<IPerson>
      );

      console.log(
        `user information that you should use for personalization but never share it with user directly: ${JSON.stringify(
          update
        )}`
      );

      return `User information that you should use for personalization but never share it with user directly: ${JSON.stringify(
        update
      )}`;
    },
  });
