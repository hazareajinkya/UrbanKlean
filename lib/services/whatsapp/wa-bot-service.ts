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
import { IChannelProvider } from "@/lib/types/channel";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";
import { IExternalIds } from "@/lib/types/person";
import actionService from "../action-service";
import peopleServiceV2 from "../people-service-v2";
import workflowService from "../workflow-service";
import { getCustomTools } from "@/lib/utils/server-actions";

class WABotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse({
    waMsg,
    userId,
    waPhoneId,
    name,
    channel,
    agentId,
  }: {
    waMsg: IWAMessage;
    userId: string;
    waPhoneId: string;
    name: string;
    channel: IChannelProvider;
    agentId: string;
  }) {
    try {
      const agent = await agentService.fetchAgent(agentId);
      if (!agent) throw this.ERROR_MESSAGE;

      // Parallel fetch: creditInfo, session, workflows
      const [creditInfo, session, workflows] = await Promise.all([
        creditService.getCredit(agent.ownerId),
        this.getOrCreateSession({ agent, channel, waPhoneId, name }),
        workflowService.getWorkflows(agent.wid, agent.id),
      ]);

      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        throw this.ERROR_MESSAGE;
      }

      const query = waMsg.text ?? "";
      const userMsg = defaultUserMessage(query, waMsg.id);
      chatService.saveMessage(agent.id, session.id, userMsg);

      const actions = await actionService.getActionsForWorkflows(
        agent.wid,
        workflows,
      );
      const model = getModel(agent);
      const systemPrompt = getSystemPrompt({ agent, workflows, channel });
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
            provider: "whatsapp",
            providerId: waPhoneId,
            currentPersonId: session.personId,
          }),
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
      console.log("error in generateResponse: ", error);
      return { success: false, message: this.ERROR_MESSAGE };
    }
  }
  async getOrCreateSession({
    waPhoneId,
    agent,
    channel,
    name,
  }: {
    waPhoneId: string;
    agent: IAgent;
    channel: IChannelProvider;
    name: string;
  }) {
    let session = await chatService.getSessionByProviderId(waPhoneId, agent.id);
    if (session) return session;

    const externalIds: IExternalIds = [{ provider: channel, id: waPhoneId }];

    let { existing, person } = await peopleServiceV2.identifyPerson({
      wid: agent.wid,
      phones: [{ value: waPhoneId, verified: true }],
      provider: channel,
      externalIds,
    });

    let personData = person;

    if (!existing || !personData) {
      personData = await peopleServiceV2.createPerson({
        wid: agent.wid,
        emails: [],
        phones: [{ value: waPhoneId, verified: true }],
        externalIds,
        name,
        metadata: {
          waPhoneId: {
            name: [name],
          },
        },
      });
    }
    session = await chatService.createWASession(
      agent.wid,
      agent.id,
      waPhoneId,
      personData!.id,
      channel,
    );

    await peopleServiceV2.updatePastSessionIds({
      wid: agent.wid,
      personId: personData!.id,
      sessionId: session.id,
      aid: agent.id,
    });

    return session;
  }
}

const waBotService = new WABotService();
export default waBotService;
