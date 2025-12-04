import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import { openai } from "@ai-sdk/openai";
import {
  convertToCoreMessages,
  convertToModelMessages,
  createIdGenerator,
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
  coreSystemPrompt,
  experimentalSystemPrompt,
} from "@/prompts/system-prompt";
import { executeAPIAction } from "@/lib/utils/api-actions-utils";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { IChatMessage } from "@/lib/types/session";
import { convertToMyModelMessages } from "@/components/chat/chat-utils";
import { v4 } from "uuid";

export async function POST(req: Request) {
  try {
    const {
      messages,
      aid,
      deviceId,
      personId,
      sessionId,
    }: {
      messages: IChatMessage[];
      aid: string;
      deviceId: string;
      personId?: string;
      sessionId: string;
    } = await req.json();

    console.log("sessionId: ", sessionId);
    console.log("deviceId: ", deviceId);
    console.log("personId: ", personId);

    const agent = await agentService.fetchAgent(aid);
    if (!agent) throw new Error("Agent not found");

    // Ensure session exists in DB before processing the message
    await chatService.ensureSession(
      agent.wid,
      aid,
      sessionId,
      personId,
      deviceId
    );

    // Save the user message after session is ensured
    const userMessage = messages[messages.length - 1];
    await chatService.saveMessage(aid, sessionId, userMessage);

    let model = getModel(agent);

    const lastMessage = getLastMessage(messages);
    const actions = await actionService.getActions(agent.wid);
    const customTools = getCustomTools(actions);
    const systemPrompt = await getSystemPrompt(
      agent,
      lastMessage,
      "web",
      personId
    );
    const convertedMessages = convertToMyModelMessages(messages);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertedMessages,
      stopWhen: stepCountIs(5),
      tools: {
        ...customTools,
        collectInformation: collectInformation(
          agent.wid,
          agent.id,
          sessionId,
          "web",
          deviceId
        ),
        searchKnowledge: searchKnowledge(agent.wid),
      },

      onError: (error) => {
        console.error("Error: ", (error.error as any).response, error);
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        const aiMessage = {
          ...responseMessage,
          id: v4(),
          metadata: {
            ...responseMessage.metadata,
            createdAt: new Date().toISOString(),
          },
        } as IChatMessage;

        await chatService.saveMessage(agent.id, sessionId, aiMessage);
      },
    });
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

const getLastMessage = (messages: IChatMessage[]): string => {
  return messages[messages.length - 1].parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
};
