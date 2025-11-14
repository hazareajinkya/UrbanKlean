import { IPostmarkMessage } from "@/lib/types/postmark-api";
import postmarkService from "./postmark-service";
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
import { v4 } from "uuid";
import { convertToModelMessages, generateText, stepCountIs } from "ai";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { collectInformation } from "@/lib/tools/collect-info";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";

class PostmarkBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    postmarkMsg: IPostmarkMessage,
    email: string,
    channel: IChannelProvider // userId: string, // waMsg: IWAMessage,
  ) {
    try {
      //   //supercx ai agent id
      const aid = await channelService.resolveAgent(email, channel);
      console.log("resolved agent: ", aid);
      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      let session = await this.getOrCreateSession(email, agent, channel);

      // Format textBody to preserve intended line breaks and structure
      //   const query = (postmarkMsg.textBody ?? "").replace(/\r\n|\r|\n/g, "\n");
      const query = postmarkMsg.textBody ?? "";

      console.log("postmarkMsg: ", postmarkMsg.textBody);
      console.log("query: ", query);
      const userMsg = defaultUserMessage(query, postmarkMsg.id);

      const person = await peopleService.getPerson(
        agent.wid,
        session.personId ?? "test"
      );
      console.log("person: ", person);
      console.log("personId: ", session.personId);

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
          collectInformation: collectInformation(
            agent.wid,
            agent.id,
            session.id,
            undefined
          ),
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
    email: string,
    agent: IAgent,
    channel: IChannelProvider
  ) {
    let session = await chatService.getSession(email, agent.id);
    if (!session) {
      const { personId } = await peopleService.identifyPerson({
        wid: agent.wid,
        email: email,
        externalIds: { email: email },
      });

      session = await chatService.createWASession(
        agent.wid,
        agent.id,
        email,
        personId,
        channel
      );
    }
    return session;
  }
}

const postmarkBotService = new PostmarkBotService();
export default postmarkBotService;
