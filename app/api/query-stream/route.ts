import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import qdClient from "@/lib/clients/qdrant-client";
import embeddingService from "@/lib/services/embedding-service";
import knowledgeService from "@/lib/services/knowledge-service";
import { latency } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { messages, aid }: { messages: UIMessage[]; aid: string } =
      await req.json();

    let model = openai("gpt-4.1-mini");
    const agent = await agentService.fetchAgent(aid);

    if (!agent) throw new Error("Agent not found");

    if (agent.settings.model.includes("gpt")) {
      model = openai(agent.settings.model);
    } else if (agent.settings.model.includes("gemini")) {
      model = google(agent.settings.model);
    }

    const lastMessage = getLastMessage(messages);
    console.log("lastMessage: ", lastMessage);

    // latency.start();
    // const context = await retrieveContext(agent.wid, lastMessage);
    // console.log("context: ", context);
    // latency.end();

    const result = streamText({
      model,
      system: `You're general assistant can do anything. Always respond in proper formatting emapthatically humanly possible with feelings and in as little words as possible.

      If you have user name use that in conversation often
      You will first collect a lead from the user using the collectLead tool and then only answer whatever user is asking

      Use searchKnowledge tool to search the knowledge base .

      USE SEARCHKNOWLEDGE TOOL EVERYTIME
      
      `,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: {
        collectLead: {
          name: "Lead generation",
          description: "Collect a lead from the user",
          inputSchema: z.object({
            name: z.string(),
            email: z.string(),
          }),
          execute: async ({ name, email, phone, message }) => {
            console.log("collectLead: ", name, email, phone, message);
          },
        },

        searchKnowledge: {
          name: "Search knowledge",
          description: "Search the knowledge base",
          inputSchema: z.object({
            query: z
              .string()
              .describe(
                "make this format yourself so that it can better search knowledgebase"
              ),
          }),
          execute: async ({ query }) => {
            console.log("searchKnowledge: ", query);
            latency.start();
            const context = await retrieveContext(agent.wid, query);
            latency.end();
            return context;
          },
        },
      },

      onError: (error) => {
        console.error("Error: ", (error.error as any).response, error);
      },
    });

    return result.toUIMessageStreamResponse({});
  } catch (error: any) {
    return new Response(error.message || "Error processing request", {
      status: 500,
    });
  }
}

const retrieveContext = async (wid: string, query: string) => {
  try {
    await knowledgeService.checkCollection(wid);
    const embedding = await embeddingService.createEmbedding(query);

    const searchResults = await qdClient.search(wid, {
      vector: embedding,
      limit: 5,
      score_threshold: 0.7,
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

const getLastMessage = (messages: UIMessage[]): string => {
  return messages[messages.length - 1].parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
};
