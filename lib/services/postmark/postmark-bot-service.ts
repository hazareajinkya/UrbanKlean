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
import actionService from "../action-service";
import { getCustomTools } from "@/lib/utils";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";
import { IExternalIds } from "@/lib/types/person";
import peopleServiceV2 from "../people-service-v2";

class PostmarkBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    postmarkMsg: IPostmarkMessage,
    email: string,
    personEmail: string,
    channel: IChannelProvider // userId: string, // waMsg: IWAMessage,
  ) {
    try {
      //   //supercx ai agent id
      const aid = await channelService.resolveAgent(email, channel);

      console.log("resolved agent: ", aid);
      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      const creditInfo = await creditService.getCredit(agent.ownerId);
      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        throw this.ERROR_MESSAGE;
      }

      let session = await this.getOrCreateSession({
        email: personEmail,
        agent,
        channel,
        name: postmarkMsg.fromName,
      });

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
      const actions = await actionService.getActionsInWorkflow(
        agent.wid,
        agent.id
      );
      const customTools = getCustomTools(actions);
      //save user message
      chatService.saveMessage(agent.id, session.id, userMsg);
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

const postmarkBotService = new PostmarkBotService();
export default postmarkBotService;
