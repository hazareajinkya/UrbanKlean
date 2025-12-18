import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import agentService from "../agent-service";
import { convertToModelMessages, generateText, stepCountIs } from "ai";
import { collectInformation } from "@/lib/tools/collect-info";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import chatService from "../chat-service";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { IAgent } from "@/lib/types/agent";
import peopleService from "../people-service";
import { metadata } from "@/app/layout";
import { v4 } from "uuid";
import channelService from "../channel-service";
import { IChannelProvider } from "@/lib/types/channel";
import { IInstaMessage } from "@/lib/types/insta-api";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";
import actionService from "../action-service";
import { getCustomTools } from "@/lib/utils";

class InstaBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    instaMsg: IInstaMessage,
    userId: string,
    instaUserId: string,
    channel: IChannelProvider
  ) {
    try {
      //supercx ai agent id
      const aid = await channelService.resolveAgent(userId, channel);
      console.log("resolved agent: ", aid);

      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      const creditInfo = await creditService.getCredit(agent.ownerId);
      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        return { success: false, message: "Insufficient credits" };
      }

      let session = await this.getOrCreateSession(instaUserId, agent, channel);

      const query = instaMsg.text ?? "";
      const userMsg = defaultUserMessage(query, instaMsg.id);

      // const person = await peopleService.getPerson(agent.wid, session.personId);
      // console.log("person: ", person);
      // console.log("personId: ", session.personId);

      //save user message
      chatService.saveMessage(agent.id, session.id, userMsg);
      const actions = await actionService.getActionsInWorkflow(
        agent.wid,
        agent.id
      );
      const customTools = getCustomTools(actions);

      //prepare messages for ai
      const chatHistory: IChatMessage[] = [
        ...session.messages,
        userMsg,
        {
          id: v4(),
          role: "system",
          metadata: { createdAt: new Date().toISOString() },
          parts: [{ type: "text", text: `PersonID: ${session.personId}` }],
        },
      ];
      const messages = convertToModelMessages(chatHistory);

      const model = getModel(agent);
      const systemPrompt = await getSystemPrompt(agent, query, channel);

      const result = await generateText({
        model,
        system: systemPrompt,
        messages,
        stopWhen: stepCountIs(5),
        tools: {
          ...customTools,
          collectInformation: collectInformation(
            agent.wid,
            agent.id,
            session.id,
            "instagram",
            session.providerId
          ),
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
        "chat_response"
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

  async getOrCreateSession(
    instaUserId: string,
    agent: IAgent,
    channel: IChannelProvider
  ) {
    let session = await chatService.getSessionByProviderId(
      instaUserId,
      agent.id
    );
    if (!session) {
      const { personId } = await peopleService.identifyPerson({
        wid: agent.wid,
        phone: instaUserId,
        externalIds: { insta: instaUserId },
      });

      session = await chatService.createInstaSession(
        agent.wid,
        agent.id,
        instaUserId,
        personId,
        channel
      );
    }
    return session;
  }
}

const instaBotService = new InstaBotService();
export default instaBotService;
