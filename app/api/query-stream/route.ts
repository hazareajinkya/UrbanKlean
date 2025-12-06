import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import creditService from "@/lib/services/credit-service";
import { stepCountIs, streamText, tool, ToolSet } from "ai";
import { z } from "zod";
import actionService from "@/lib/services/action-service";
import { collectInformation } from "@/lib/tools/collect-info";
import { IAction } from "@/lib/types/actions";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import { executeAPIAction } from "@/lib/utils/api-actions-utils";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { IChatMessage } from "@/lib/types/session";
import { convertToMyModelMessages } from "@/components/chat/chat-utils";
import { v4 } from "uuid";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

export async function POST(req: Request) {
  try {
    const {
      messages,
      aid,
      deviceId,
      personId,
      sessionId,
      fromPage,
    }: {
      messages: IChatMessage[];
      aid: string;
      deviceId: string;
      personId?: string;
      sessionId: string;
      fromPage?: string;
    } = await req.json();

    console.log("sessionId: ", sessionId);
    console.log("deviceId: ", deviceId);
    console.log("personId: ", personId);
    console.log("fromPage: ", fromPage);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new Response(getRandomRateLimitMessage(), {
        status: 429,
      });
    }

    const agent = await agentService.fetchAgent(aid);
    if (!agent) throw new Error("Agent not found");

    const creditInfo = await creditService.getCredit(agent.ownerId);
    if (!creditInfo || creditInfo.availableCredit < 2) {
      return new Response("Insufficient credits", {
        status: 400,
      });
    }

    // Ensure session exists in DB before processing the message
    await chatService.ensureSession(
      agent.wid,
      aid,
      sessionId,
      personId,
      deviceId,
      fromPage
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
        await creditService.decreaseCredit(2, creditInfo);
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

// Change we needed
const rateLimitMessages = [
  "Too many messages — try again in a moment.",
  "Hold on a sec, you're sending a bit fast.",
  "One moment, please slow down.",
  "You're going a little fast — try again soon.",
  "Please wait a moment before sending more.",
  "Give it a sec and try again.",
  "Hang tight — you're sending too quickly.",
  "A quick pause, then try again.",
];
const getRandomRateLimitMessage = () => {
  return rateLimitMessages[
    Math.floor(Math.random() * rateLimitMessages.length)
  ];
};
