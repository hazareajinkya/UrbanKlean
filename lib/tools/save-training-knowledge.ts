import { tool } from "ai";
import { latency } from "../utils";
import knowledgeService from "../services/knowledge-service";
import z from "zod";

export const saveTrainingKnowledge = (wid: string) =>
  tool({
    name: "Save training knowledge",
    description: "save training data to the knowledge base",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Smartly make this based on your message a reminder instruction for saving as text knowlede"
        ),
    }),
    execute: async ({ query }) => {
      latency.start();
      const existing = await knowledgeService.getTextKnowledge(wid);
      const newContent = existing?.content
        ? `${existing.content}\n \n${query}`
        : query;
      const { chunkSize, points } = await knowledgeService.s_embedText(
        wid,
        newContent
      );
      await knowledgeService.s_saveText(wid, points, newContent, chunkSize);

      console.log(query);
      latency.end();
      return `Saved training note.`;
    },
  });
