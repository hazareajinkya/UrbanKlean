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
import { collectInformation } from "@/lib/tools/collect-info";
import { IAgent } from "@/lib/types/agent";
import { IAction } from "@/lib/types/actions";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import {
  defaultSystemPrompt,
  experimentalSystemPrompt,
} from "@/prompts/system-prompt";
import { executeAPIAction } from "@/lib/utils/api-actions-utils";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { IChatMessage } from "@/lib/types/session";

export async function POST(req: Request) {
  try {
    const { messages, aid }: { messages: IChatMessage[]; aid: string } =
      await req.json();

    const agent = await agentService.fetchAgent(aid);

    if (!agent) throw new Error("Agent not found");

    let model = getModel(agent);

    const lastMessage = getLastMessage(messages);
    const actions = await actionService.getActions(agent.wid);
    const customTools = getCustomTools(actions);
    const systemPrompt = await getSystemPrompt(agent, lastMessage, "chat");

    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools: {
        ...customTools,
        collectInformation: collectInformation(agent.wid),
        searchKnowledge: searchKnowledge(agent),
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

const getCustomTools = (actions: IAction[]): ToolSet => {
  return actions.reduce((acc, action) => {
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
        return executeAPIAction(action, params);
      },
    });
    return acc;
  }, {} as ToolSet);
};

const getLastMessage = (messages: UIMessage[]): string => {
  return messages[messages.length - 1].parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
};
