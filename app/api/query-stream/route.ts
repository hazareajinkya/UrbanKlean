import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import creditService from "@/lib/services/credit-service";

import { Geo, geolocation } from "@vercel/functions";
import { creditCosts } from "@/lib/constants";
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
import { usageService } from "@/lib/services/usage-service";
import { defaultUsage } from "@/lib/types/usage";
import { v4 } from "uuid";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIp, getCustomTools } from "@/lib/utils";

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

    const ip = getClientIp(req);

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new Response(getRandomRateLimitMessage(), {
        status: 429,
      });
    }

    const agent = await agentService.fetchAgent(aid);
    if (!agent) throw new Error("Agent not found");

    const creditInfo = await creditService.getCredit(agent.ownerId);

    if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
      console.log("Insufficient credits: ", creditInfo);
      return new Response("Insufficient credits", {
        status: 400,
      });
    }

    const geo = geolocation(req);

    // Ensure session exists in DB before processing the message
    await chatService.ensureSession(
      agent.wid,
      aid,
      sessionId,
      personId,
      deviceId,
      fromPage,
      geo
    );

    // Save the user message after session is ensured
    const userMessage = messages[messages.length - 1];
    await chatService.saveMessage(aid, sessionId, userMessage);

    let model = getModel(agent);

    const lastMessage = getLastMessage(messages);
    const actions = await actionService.getActionsInWorkflow(
      agent.wid,
      agent.id
    );
    const customTools = getCustomTools(actions);

    const systemPrompt = await getSystemPrompt(
      agent,
      lastMessage,
      "web",
      personId,
      geo
    );
    const convertedMessages = convertToMyModelMessages(messages);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertedMessages,
      stopWhen: stepCountIs(5),
      tools: {
        ...customTools,
        collectInformation: collectInformation({
          wid: agent.wid,
          aid: agent.id,
          sessionId: sessionId,
          provider: "web",
          providerId: deviceId,
          ips: [ip],
        }),
        searchKnowledge: searchKnowledge(agent.wid, agent),
      },

      onError: (error) => {
        console.error("Error: ", (error.error as any).response, error);
      },
    });

    const totalTokens = (await result.usage).totalTokens;
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onFinish: async ({ responseMessage }) => {
        const aiMessage = {
          ...responseMessage,
          id: v4(),
          metadata: {
            creditCost: creditCosts.query || 0,
            tokenUsage: totalTokens || 0,
            model: model.modelId,
            createdAt: new Date().toISOString(),
          },
        } as IChatMessage;

        await chatService.saveMessage(agent.id, sessionId, aiMessage);
        await creditService.decreaseCredit(creditCosts.query, creditInfo);

        const usage = defaultUsage(
          agent.wid,
          agent.id,
          sessionId,
          "chat_response"
        );
        usage.amount = -creditCosts.query;
        usage.metadata = {
          model: model.modelId,
          tokenUsage: totalTokens || 0,
        };

        await usageService.addUsage(agent.ownerId, usage);
      },
    });
  } catch (error: any) {
    console.error("Error: ", error);
    return new Response(error.message || "Error processing request", {
      status: 500,
    });
  }
}

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
