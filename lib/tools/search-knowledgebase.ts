import { tool } from "ai";
import z from "zod";
import { latency } from "../utils";
import knowledgeService from "../services/knowledge-service";
import embeddingService from "../services/embedding-service";
import qdClient from "../clients/qdrant-client";
import { IAgent } from "../types/agent";

export const searchKnowledge = (agent: IAgent) =>
  tool({
    name: "Search knowledge",
    description: "Search the knowledge base",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Smartly make this based on prev chats and user information format yourself so that it can better search knowledgebase"
        ),
    }),
    execute: async ({ query }) => {
      console.log("searching knowledgebase: ", query);
      latency.start();
      const context = await retrieveContext(agent.wid, query);
      latency.end();
      return context;
    },
  });

const retrieveContext = async (wid: string, query: string) => {
  try {
    await knowledgeService.checkCollection(wid);
    const embedding = await embeddingService.createEmbedding(query);

    const searchResults = await qdClient.search(wid, {
      vector: embedding,
      limit: 5,
      score_threshold: 0.5,
    });

    console.log("searchResults: ", searchResults);

    return searchResults
      .map((result) => result.payload?.text)
      .filter(Boolean)
      .join("\n\n");
  } catch (error) {
    console.error("Error retrieving context: ", error);
    return "";
  }
};
