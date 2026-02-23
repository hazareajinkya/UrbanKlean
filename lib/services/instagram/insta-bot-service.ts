import axios, { AxiosError } from "axios";
import storageService from "../storage-service";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import agentService from "../agent-service";
import { convertToModelMessages, generateText, stepCountIs } from "ai";
import { collectInformation } from "@/lib/tools/collect-info";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import chatService from "../chat-service";
import {
  defaultAImessage,
  defaultUserMessage,
  defaultUserImageMessage,
  IChatMessage,
} from "@/lib/types/session";
import { IAgent } from "@/lib/types/agent";
import { IChannelProvider } from "@/lib/types/channel";
import { IInstaMessage } from "@/lib/types/insta-api";
import creditService from "../credit-service";
import { creditCosts } from "@/lib/constants";
import { defaultUsage } from "@/lib/types/usage";
import usageService from "../usage-service";
import actionService from "../action-service";
import { getCustomTools } from "@/lib/utils";
import { IExternalIds } from "@/lib/types/person";
import peopleServiceV2 from "../people-service-v2";
import instaService from "./insta-service";
import workflowService from "../workflow-service";

class InstaBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";
  MAX_MESSAGE_CHARS = 880;

  async mirrorImageToStorage(args: {
    imageUrl: string;
    agentId: string;
    sessionId: string;
    messageId: string;
  }) {
    const response = await axios.get<ArrayBuffer>(args.imageUrl, {
      responseType: "arraybuffer",
    });
    const mediaType =
      (response.headers["content-type"] as string | undefined)
        ?.split(";")[0]
        ?.trim() || "image/jpeg";
    const ext = mediaType.split("/")[1] || "jpg";
    const storagePath = `agents/${args.agentId}/sessions/${args.sessionId}/${args.messageId}.${ext}`;
    const { downloadURL } = await storageService.uploadBuffer(
      response.data,
      storagePath,
      mediaType,
    );
    return { url: downloadURL, mediaType };
  }

  splitMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText) return [];
    if (cleanText.length <= this.MAX_MESSAGE_CHARS) return [cleanText];

    const chunks: string[] = [];
    let start = 0;
    while (start < cleanText.length) {
      let end = Math.min(start + this.MAX_MESSAGE_CHARS, cleanText.length);
      if (end < cleanText.length) {
        const lastSpaceIndex = cleanText.lastIndexOf(" ", end);
        if (lastSpaceIndex > start + Math.floor(this.MAX_MESSAGE_CHARS * 0.6)) {
          end = lastSpaceIndex;
        }
      }
      const chunk = cleanText.slice(start, end).trim();
      if (chunk) chunks.push(chunk);
      start = end;
      while (cleanText[start] === " ") start += 1;
    }

    return chunks;
  }

  async generateResponse({
    instaMsg,
    instaUserId,
    channel,
    agentId,
    accessToken,
  }: {
    instaMsg: IInstaMessage;
    instaUserId: string;
    channel: IChannelProvider;
    agentId: string;
    accessToken: string;
  }) {
    try {
      if (!agentId) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(agentId);
      if (!agent) throw this.ERROR_MESSAGE;

      // Parallel fetch: creditInfo, session, workflows
      const [creditInfo, session, workflows] = await Promise.all([
        creditService.getCredit(agent.ownerId),
        this.getOrCreateSession({ instaUserId, agent, channel, accessToken }),
        workflowService.getWorkflows(agent.id),
      ]);

      if (!creditInfo || creditInfo.availableCredit < creditCosts.query) {
        console.log("Insufficient credits: ", creditInfo);
        return { success: false, message: "Insufficient credits" };
      }

      let userMsg;
      if (instaMsg.type === "image" && instaMsg.imageUrl) {
        const { url, mediaType } = await this.mirrorImageToStorage({
          imageUrl: instaMsg.imageUrl,
          agentId: agent.id,
          sessionId: session.id,
          messageId: instaMsg.id,
        });
        userMsg = defaultUserImageMessage(url, mediaType, instaMsg.id);
      } else {
        userMsg = defaultUserMessage(instaMsg.text ?? "", instaMsg.id);
      }
      chatService.saveMessage(agent.id, session.id, userMsg);

      const actions = await actionService.getActionsForWorflows(
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
            provider: "instagram",
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
      const messageChunks = this.splitMessage(result.text);
      return { success: true, message: result.text, messages: messageChunks };
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof AxiosError) {
        console.log("error response: ", error.response?.data);
      }
      return { success: false, message: this.ERROR_MESSAGE };
    }
  }

  async getOrCreateSession({
    instaUserId,
    agent,
    channel,
    accessToken,
  }: {
    instaUserId: string;
    agent: IAgent;
    channel: IChannelProvider;
    accessToken: string;
  }) {
    let session = await chatService.getSessionByProviderId(
      instaUserId,
      agent.id,
    );
    if (session) return session;

    const externalIds: IExternalIds = [{ provider: channel, id: instaUserId }];

    let { existing, person } = await peopleServiceV2.identifyPerson({
      wid: agent.wid,
      provider: channel,
      externalIds,
    });

    let personData = person;

    if (!existing || !personData) {
      const profile = await instaService.getUserProfile({
        userId: instaUserId,
        accessToken: accessToken,
      });
      personData = await peopleServiceV2.createPerson({
        metadata: {
          instaUserId: {
            name: [profile.name],
            profilePic: [profile.username],
          },
        },
        name: profile.name,
        wid: agent.wid,
        emails: [],
        phones: [],
        externalIds,
      });
    }
    session = await chatService.createInstaSession(
      agent.wid,
      agent.id,
      instaUserId,
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

const instaBotService = new InstaBotService();
export default instaBotService;
