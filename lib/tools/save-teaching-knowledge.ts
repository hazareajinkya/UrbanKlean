import { tool } from "ai";
import { latency } from "../utils";
import z from "zod";
import axiosClient from "../clients/axios-client";

export const saveTeachKnowledge = (wid: string) =>
  tool({
    name: "Save training knowledge",
    description: "Save structured training knowledge (title + description)",
    inputSchema: z.object({
      title: z
        .string()
        .describe("Max three words title for the knowledge entry"),
      description: z.string().describe("Detailed training knowledge to save"),
    }),
    outputSchema: z.object({
      title: z.string().describe("Confirmation title"),
      description: z.string().describe("Confirmation description"),
    }),
    execute: async ({ title, description }) => {
      latency.start();

      try {
        await axiosClient.post(`/api/embeddings/${wid}/teach`, {
          content: description,
          title,
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
