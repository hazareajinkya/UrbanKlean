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
import { v4 } from "uuid";
import channelService from "../channel-service";
import { IChannelProvider } from "@/lib/types/channel";
import { IMessengerMessage } from "@/lib/types/messenger-api";

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
      //supercx ai agent id
      const aid = await channelService.resolveAgent(userId, channel);
      console.log("resolved agent: ", aid);

      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      let session = await this.getOrCreateSession(
        messengerUserId,
        agent,
        channel
      );

      const query = messengerMsg.text ?? "";
      const userMsg = defaultUserMessage(query, messengerMsg.id);

      // const person = await peopleService.getPerson(agent.wid, session.personId);
      // console.log("person: ", person);
      // console.log("personId: ", session.personId);

      //save user message
      chatService.saveMessage(agent.id, session.id, userMsg);

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
          // collectInformation: collectInformation(agent.wid),
          searchKnowledge: searchKnowledge(agent.wid),
        },
      });

      //save ai message
      const aiMsg = defaultAImessage(result.text);
      chatService.saveMessage(agent.id, session.id, aiMsg);

      console.log("ai response: ", result.text);
      return { success: true, message: result.text };
    } catch (error) {
      console.log("error: ", error);
      return { success: false, message: this.ERROR_MESSAGE };
    }
  }

  async getOrCreateSession(
    messengerUserId: string,
    agent: IAgent,
    channel: IChannelProvider
  ) {
    let session = await chatService.getSession(messengerUserId, agent.id);
    if (!session) {
      const { personId } = await peopleService.identifyPerson({
        wid: agent.wid,
        phone: messengerUserId,
        externalIds: { messenger: messengerUserId },
      });

      session = await chatService.createMessengerSession(
        agent.wid,
        agent.id,
        messengerUserId,
        personId,
        channel
      );
    }
    return session;
  }
}

const messengerBotService = new MessengerBotService();
export default messengerBotService;
