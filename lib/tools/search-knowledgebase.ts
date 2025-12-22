import { tool } from "ai";
import z from "zod";
import { latency } from "../utils";
import knowledgeService from "../services/knowledge-service";
import embeddingService from "../services/embedding-service";
import qdClient from "../clients/qdrant-client";
import { IAgent } from "../types/agent";

export const searchKnowledge = (wid: string, agent?: IAgent) =>
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
      const context = await retrieveContext(wid, query, agent);
      latency.end();
      return context;
    },
  });

const retrieveContext = async (wid: string, query: string, agent?: IAgent) => {
  try {
    await knowledgeService.checkCollection(wid);
    const embedding = await embeddingService.createEmbedding(query);

    if (
      agent &&
      (!agent.knowledgeFolders || agent.knowledgeFolders.length === 0)
    ) {
      console.log("Agent has no folder access");
      return "";
    }

    let filter = undefined;

    if (agent?.knowledgeFolders?.length) {
      const validFolders = agent.knowledgeFolders.filter(Boolean);

      if (validFolders.length > 0) {
        filter = {
          must: [
            {
              key: "folderId",
              match: { any: validFolders },
            },
          ],
        };
      }
    }

    const searchResults = await qdClient.search(wid, {
      vector: embedding,
      limit: 5,
      score_threshold: 0.5,
      ...(filter ? { filter } : {}),
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
