import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import agentService from "../agent-service";
import { convertToModelMessages, generateText, stepCountIs } from "ai";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import chatService from "../chat-service";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { IAgent } from "@/lib/types/agent";
import peopleService from "../people-service";
import { IExternalIds } from "@/lib/types/person";
import { v4 } from "uuid";
import channelService from "../channel-service";
import { IChannelProvider } from "@/lib/types/channel";
import { IMessengerMessage } from "@/lib/types/messenger-api";
import actionService from "../action-service";
import { getCustomTools } from "@/lib/utils";
import { collectInformation } from "@/lib/tools/collect-info";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";

class MessengerBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    messengerMsg: IMessengerMessage,
    userId: string,
    messengerUserId: string,
    channel: IChannelProvider
  ) {
    try {
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

      let session = await this.getOrCreateSession({
        messengerUserId,
        agent,
        channel,
      });

      const query = messengerMsg.text ?? "";
      const userMsg = defaultUserMessage(query, messengerMsg.id);

      // const person = await peopleService.getPerson(agent.wid, session.personId);
      // console.log("person: ", person);
      // console.log("personId: ", session.personId);

      //save user message
      chatService.saveMessage(agent.id, session.id, userMsg);

      // Custom tools geting actions from the workflow
      const actions = await actionService.getActionsInWorkflow(
        agent.wid,
        agent.id
      );
      const customTools = getCustomTools(actions);

      //prepare messages for ai
      const chatHistory: IChatMessage[] = [...session.messages, userMsg];
      const messages = convertToModelMessages(chatHistory);

      const model = getModel(agent);
      const systemPrompt = await getSystemPrompt(
        agent,
        query,
        channel,
        session.personId
      );

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
            "messenger",
            messengerUserId
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

  async getOrCreateSession({
    messengerUserId,
    agent,
    channel,
  }: {
    messengerUserId: string;
    agent: IAgent;
    channel: IChannelProvider;
  }) {
    let session = await chatService.getSessionByProviderId(
      messengerUserId,
      agent.id
    );
    if (session) return session;

    const externalIds: IExternalIds = [
      { provider: channel, id: messengerUserId },
    ];

    let { existing, person } = await peopleService.identify({
      wid: agent.wid,
      emails: [],
      externalIds,
    });

    let personData = person;

    if (!existing || !personData) {
      personData = await peopleService.create2({
        wid: agent.wid,
        emails: [],
        phones: [],
        externalIds,
      });
    }

    session = await chatService.createMessengerSession(
      agent.wid,
      agent.id,
      messengerUserId,
      personData!.id,
      channel
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

const messengerBotService = new MessengerBotService();
export default messengerBotService;
