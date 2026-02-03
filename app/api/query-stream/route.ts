import agentService from "@/lib/services/agent-service";
import chatService from "@/lib/services/chat-service";
import creditService from "@/lib/services/credit-service";

import { Geo, geolocation, ipAddress } from "@vercel/functions";
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
import { normIp, getCustomTools, getClientIp, latency } from "@/lib/utils";
import workflowService from "@/lib/services/workflow-service";

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
    const geo = geolocation(req);
    const lastMessage = getLastMessage(messages);

    latency.start();

    // First batch: rate limit + agent + workflows (parallel with granular timing)
    const batch1Start = performance.now();
    const [rateLimitResult, agent, workflows] = await Promise.all([
      ratelimit.limit(ip).then((r) => {
        console.log(
          `  ├─ rateLimit: ${(performance.now() - batch1Start).toFixed(0)}ms`,
        );
        return r;
      }),
      agentService.fetchAgent(aid).then((a) => {
        console.log(
          `  ├─ agent: ${(performance.now() - batch1Start).toFixed(0)}ms`,
        );
        return a;
      }),
      workflowService.getWorkflows(aid).then((w) => {
        console.log(
          `  ├─ workflows: ${(performance.now() - batch1Start).toFixed(0)}ms`,
        );
        return w;
      }),
    ]);
    console.log(
      `[query-stream] Batch 1 total: ${(
        performance.now() - batch1Start
      ).toFixed(0)}ms`,
    );

    if (!rateLimitResult.success) {
      return new Response(getRandomRateLimitMessage(), { status: 429 });
    }
    if (!agent) throw new Error("Agent not found");

    // Second batch: all agent-dependent calls (parallel with granular timing)
    const batch2Start = performance.now();
    const systemPrompt = getSystemPrompt({
      agent,
      workflows,
      channel: "web",
      personId,
      geo,
    });
    const [creditInfo, , actions] = await Promise.all([
      creditService.getCredit(agent.ownerId).then((c) => {
        console.log(
          `  ├─ credit: ${(performance.now() - batch2Start).toFixed(0)}ms`,
        );
        return c;
      }),
      chatService
        .ensureSession(
          agent.wid,
          aid,
          sessionId,
          personId,
          deviceId,
          fromPage,
          geo,
        )
        .then((s) => {
          console.log(
            `  ├─ session: ${(performance.now() - batch2Start).toFixed(0)}ms`,
          );
          return s;
        }),
      actionService.getActionsForWorflows(agent.wid, workflows).then((a) => {
        console.log(
          `  ├─ actions: ${(performance.now() - batch2Start).toFixed(0)}ms`,
        );
        return a;
      }),
    ]);

    console.log(
      `[query-stream] Batch 2 total: ${(
        performance.now() - batch2Start
      ).toFixed(0)}ms\n`,
    );

    if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
      console.log("Insufficient credits: ", creditInfo);
      return new Response("Insufficient credits", { status: 400 });
    }

    // Save user message (fire and forget)
    const userMessage = messages[messages.length - 1];
    chatService.saveMessage(aid, sessionId, userMessage);

    const model = getModel(agent);
    const customTools = getCustomTools(actions);
    const convertedMessages = convertToMyModelMessages(messages);

    console.log("model:", model.modelId);
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
          currentPersonId: personId,
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

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,

      onFinish: async ({ responseMessage }) => {
        const totalTokens = (await result.usage).totalTokens;
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

        const usage = defaultUsage(
          agent.wid,
          agent.id,
          sessionId,
          "chat_response",
        );
        usage.amount = -creditCosts.query;
        usage.metadata = {
          model: model.modelId,
          tokenUsage: totalTokens || 0,
        };

        await Promise.all([
          chatService.saveMessage(agent.id, sessionId, aiMessage),
          creditService.decreaseCredit(creditCosts.query, creditInfo),
          usageService.addUsage(agent.ownerId, usage),
        ]);

        latency.end();
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
