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
import { IWAMessage } from "@/lib/types/wa-api";
import { IAgent } from "@/lib/types/agent";
import peopleService from "../people-service";
import { metadata } from "@/app/layout";
import { v4 } from "uuid";
import channelService from "../channel-service";
import { IChannelProvider } from "@/lib/types/channel";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";

class WABotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    waMsg: IWAMessage,
    userId: string,
    waPhoneId: string,
    channel: IChannelProvider
  ) {
    try {
      //supercx ai agent id
      // const aid = await channelService.resolveAgent(userId, channel);
      const aid = "c0e54882-04fc-489e-975b-e2b7edbf2adf";
      console.log("resolved agent: ", aid);

      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;
      const creditInfo = await creditService.getCredit(agent.ownerId);
      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        throw this.ERROR_MESSAGE;
      }

      let session = await this.getOrCreateSession(waPhoneId, agent, channel);

      const query = waMsg.text ?? "";
      const userMsg = defaultUserMessage(query, waMsg.id);

      // const person = await peopleService.getPerson(agent.wid, session.personId);
      // console.log("person: ", person);
      // console.log("personId: ", session.personId);

      //save user message
      chatService.saveMessage(agent.id, session.id, userMsg);

      //prepare messages for ai
      const chatHistory: IChatMessage[] = [...session.messages, userMsg];
      const messages = convertToModelMessages(chatHistory);

      const model = getModel(agent);
      const systemPrompt = await getSystemPrompt(agent, query, channel);

      const result = await generateText({
        model,
        system: systemPrompt,
        messages,
        stopWhen: stepCountIs(5),
        tools: {
          collectInformation: collectInformation(
            agent.wid,
            agent.id,
            session.id,
            "whatsapp",
            waPhoneId,
            session.personId
          ),
          searchKnowledge: searchKnowledge(agent.wid!, agent),
        },
      });

      //save ai message
      const aiMsg = defaultAImessage(result.text);
      chatService.saveMessage(agent.id, session.id, aiMsg);
      const totalTokens = result.usage?.totalTokens;
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
    waPhoneId: string,
    agent: IAgent,
    channel: IChannelProvider
  ) {
    let session = await chatService.getSessionByProviderId(waPhoneId, agent.id);
    if (!session) {
      const { personId } = await peopleService.identifyPerson({
        wid: agent.wid,
        phone: waPhoneId,
        externalIds: { wa: waPhoneId },
      });

      session = await chatService.createWASession(
        agent.wid,
        agent.id,
        waPhoneId,
        personId,
        channel
      );
    }
    return session;
  }
}

const waBotService = new WABotService();
export default waBotService;
