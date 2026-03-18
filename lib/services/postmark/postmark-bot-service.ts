import { IPostmarkMessage } from "@/lib/types/postmark-api";
import { IChannelProvider } from "@/lib/types/channel";
import { IAgent } from "@/lib/types/agent";
import peopleService from "../people-service";
import chatService from "../chat-service";
import channelService from "../channel-service";
import agentService from "../agent-service";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import {
  convertToModelMessages,
  gateway,
  generateObject,
  generateText,
  stepCountIs,
} from "ai";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { collectInformation } from "@/lib/tools/collect-info";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import actionService from "../action-service";
import { getCustomTools } from "@/lib/utils";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";
import { IExternalIds } from "@/lib/types/person";
import peopleServiceV2 from "../people-service-v2";
import workflowService from "../workflow-service";
import { openai } from "@ai-sdk/openai";
import z from "zod";
import { emailNeedToReplyPrompt } from "@/prompts/email-need-to-replay-prompt";
import { google } from "@ai-sdk/google";

const shouldReplyDecisionSchema = z.object({
  shouldReply: z.boolean().describe("Whether the email requires a reply "),
  reason: z.string().min(3).max(240).describe("The reason for the decision"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("The confidence level of the decision"),
});

class PostmarkBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async shouldReplyToEmail(postmarkMsg: IPostmarkMessage) {
    const emailContent = (
      postmarkMsg.strippedTextReply ||
      postmarkMsg.textBody ||
      ""
    ).trim();

    if (!emailContent) {
      return {
        shouldReply: false,
        reason: "Empty email body",
        confidence: 1,
      };
    }

    const truncatedContent = emailContent.slice(0, 4000);

    try {
      const result = await generateObject({
        model: gateway("openai/gpt-oss-120b"),
        schema: shouldReplyDecisionSchema,
        prompt: emailNeedToReplyPrompt(postmarkMsg, truncatedContent),
      });
      return result.object;
    } catch (error) {
      console.error("Postmark shouldReply classifier failed:", error);
      return {
        shouldReply: false,
        reason: "Classifier failure fallback",
        confidence: 0,
      };
    }
  }

  async generateResponse(
    postmarkMsg: IPostmarkMessage,
    email: string,
    personEmail: string,
    channel: IChannelProvider, // userId: string, // waMsg: IWAMessage,
  ) {
    try {
      const aid = await channelService.resolveAgent(email, channel);
      console.log("resolved agent: ", aid);
      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      // Parallel fetch: creditInfo, session, workflows
      const [creditInfo, session, workflows] = await Promise.all([
        creditService.getCredit(agent.ownerId),
        this.getOrCreateSession({
          email: personEmail,
          agent,
          channel,
          name: postmarkMsg.fromName,
        }),
        workflowService.getWorkflows(agent.id),
      ]);

      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        throw this.ERROR_MESSAGE;
      }

      const query = postmarkMsg.textBody ?? "";
      console.log("postmarkMsg: ", postmarkMsg.textBody);
      console.log("query: ", query);
      const userMsg = defaultUserMessage(query, postmarkMsg.id);
      chatService.saveMessage(agent.id, session.id, userMsg);

      const actions = await actionService.getActionsForWorflows(
        agent.wid,
        workflows,
      );
      const model = getModel(agent);
      const systemPrompt = getSystemPrompt({
        agent,
        workflows,
        channel,
        personId: session.personId,
        name: postmarkMsg.fromName,
        email: personEmail,
      });
      const customTools = getCustomTools(actions);
      const chatHistory: IChatMessage[] = [...session.messages, userMsg];
      const messages = convertToModelMessages(chatHistory);
      const result = await generateText({
        model,
        system: systemPrompt,
        messages,
        stopWhen: stepCountIs(5),
        tools: {
          ...customTools,
          collectInformation: collectInformation({
            wid: agent.wid,
            aid: agent.id,
            sessionId: session.id,
            provider: "email",
            providerId: session.providerId,
            currentPersonId: session.personId,
          }),
          searchKnowledge: searchKnowledge(agent.wid, agent),
        },
      });
      //save ai message
      const aiMsg = defaultAImessage(result.text);
      chatService.saveMessage(agent.id, session.id, aiMsg);

      const totalTokens = result.usage.totalTokens;
      await creditService.decreaseCredit(creditCosts.query, creditInfo);
      const usage = defaultUsage(
        agent.wid,
        agent.id,
        session.id,
        "chat_response",
      );
      usage.amount = -creditCosts.query;
      usage.metadata = {
        model: model.modelId,
        tokenUsage: totalTokens || 0,
      };
      await usageService.addUsage(agent.ownerId, usage);

      console.log("ai response: ", result.text);
      return { success: true, message: result.text };
    } catch (error) {
      console.log("error: ", error);
      return { success: false, message: this.ERROR_MESSAGE };
    }
  }

  async getOrCreateSession({
    email,
    name,
    agent,
    channel,
  }: {
    email: string;
    name: string | undefined;
    agent: IAgent;
    channel: IChannelProvider;
  }) {
    let session = await chatService.getSessionByProviderId(email, agent.id);
    if (session) return session;

    const externalIds: IExternalIds = [{ provider: channel, id: email }];

    let { existing, person } = await peopleServiceV2.identifyPerson({
      wid: agent.wid,
      emails: [{ value: email, verified: true }],
      externalIds,
      name,
      provider: channel,
    });

    let personData = person;

    if (!existing || !personData) {
      personData = await peopleServiceV2.createPerson({
        wid: agent.wid,
        emails: [{ value: email, verified: true }],
        phones: [],
        externalIds,
        name,
      });
    }
    session = await chatService.createPostmarkSession(
      agent.wid,
      agent.id,
      email,
      personData!.id,
      channel,
    );

    await peopleService.updatePastSessionIds({
      wid: agent.wid,
      personId: personData!.id,
      sessionId: session.id,
      aid: agent.id,
    });

    return session;
  }
}

const postmarkBotService = new PostmarkBotService();
export default postmarkBotService;
