import { tool } from "ai";
import { latency } from "../utils";
import knowledgeService from "../services/knowledge-service";
import z from "zod";
import axiosClient from "../clients/axios-client";
import { v4 } from "uuid";

export const saveTrainingKnowledge = (wid: string) =>
  tool({
    name: "Save training knowledge",
    description: "Save structured training knowledge (title + description)",
    inputSchema: z.object({
      title: z.string().describe("Short title for the knowledge entry"),
      description: z.string().describe("Detailed training knowledge to save"),
    }),
    outputSchema: z.object({
      title: z.string().describe("Confirmation title"),
      description: z.string().describe("Confirmation description"),
    }),
    execute: async ({ title, description }) => {
      latency.start();
      const existing = await knowledgeService.getTextKnowledge(wid);
      const tid = existing?.id ?? v4();
      const newContent = existing?.content
        ? `${existing.content}\n\n${description}`
        : description;
      console.log(newContent);
      try {
        await axiosClient.post(`/api/embeddings/${wid}/text`, {
          content: newContent,
          tid,
        });
      } catch (error) {
        console.log("Error occured during saving training data :", error);
        throw new Error("Failed to save training data.");
      }
      latency.end();
      return {
        title: "Training knowledge saved",
        description: `Saved knowledge: ${title}`,
      };
    },
  });
