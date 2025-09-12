import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  Tool,
  tool,
  ToolSet,
  UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import qdClient from "@/lib/clients/qdrant-client";
import embeddingService from "@/lib/services/embedding-service";
import knowledgeService from "@/lib/services/knowledge-service";
import { latency } from "@/lib/utils";
import actionService from "@/lib/services/action-service";
import axios from "axios";
import workspaceService from "@/lib/services/workspace-service";
import workflowservice from "@/lib/services/workflow-service";

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

    const actions = await actionService.getActions(agent.wid);

    const customTools: ToolSet = actions.reduce((acc, action) => {
      acc[action.slug] = tool({
        name: action.name,
        description: action.description,
        inputSchema: z.object({
          ...action.inputs.reduce((acc: Record<string, any>, input) => {
            acc[input.key] = z.string().describe(input.description || "");
            return acc;
          }, {} as Record<string, any>),
        }),
        execute: async (params) => {
          // Prepare headers with authorization
          let headers = { ...action.headers };

          if (
            action.authorization.type === "api-key" &&
            action.authorization.apiKey
          ) {
            if (action.authorization.apiKey.location === "header") {
              headers[action.authorization.apiKey.key] =
                action.authorization.apiKey.value;
            }
          } else if (
            action.authorization.type === "bearer-token" &&
            action.authorization.bearerToken
          ) {
            headers.Authorization = `Bearer ${action.authorization.bearerToken.token}`;
          }

          // Prepare query parameters
          let queryParams: Record<string, any> = {};
          if (
            action.authorization.type === "api-key" &&
            action.authorization.apiKey?.location === "query"
          ) {
            queryParams[action.authorization.apiKey.key] =
              action.authorization.apiKey.value;
          }

          // Add input parameters based on request type
          const requestConfig = {
            url: action.apiUrl,
            method: action.requestType,
            headers,
            ...(action.requestType === "GET"
              ? { params: { ...params, ...queryParams } }
              : {}),
            ...(action.requestType !== "GET"
              ? { data: params, params: queryParams }
              : {}),
          };

          console.log("requestConfig: ", requestConfig);

          try {
            const response = await axios.request(requestConfig);
            return response.data;
          } catch (error) {
            console.error(`Error executing action ${action.name}:`, error);
            throw new Error(`Failed to execute action: ${action.name}`);
          }
        },
      });
      return acc;
    }, {} as ToolSet);
    // latency.start();
    // const context = await retrieveContext(agent.wid, lastMessage);
    // console.log("context: ", context);
    // latency.end();
    const tools = [];

    const workflows = await workflowservice.getWorkflows(aid);
    const workflowstext = workflows
      .map(
        (w) =>
          `Name: ${w.name} \n Trigger: ${w.trigger} \n Instructions: ${w.instructions}`
      )
      .join("\n\n");

    const result = streamText({
      model,
      system: `You're general assistant can do anything. Always respond in proper formatting emapthatically humanly possible with feelings and in as little words as possible.

      If you have user name use that in conversation whenever possible and use it empathetic nice way
      You will first collect a lead from the user using the collectLead tool and then only answer whatever user is asking

      Whenver user ask something that u don't know use searchKnowledge tool to search the knowledge base .
      Use searchKnowledge tool to search the knowledge base .

      These are workflow that u should keep in mind 
      There's trigger when u feel like that trigger statisfy then follow the instructions

      PREFER WORKFLOW OVER ANYTHING EVEN TOOL IF IT STATSIFY IN WORKFLOW FOLLOW THAT ONLY
      ${workflowstext}

      ${agent.settings.systemPrompt}

      `,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),

      tools: {
        ...customTools,
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

const getLastMessage = (messages: UIMessage[]): string => {
  return messages[messages.length - 1].parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
};
