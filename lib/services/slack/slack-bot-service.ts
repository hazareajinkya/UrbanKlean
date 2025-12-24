import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import agentService from "../agent-service";
import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  tool,
  ToolSet,
} from "ai";
import { collectInformation } from "@/lib/tools/collect-info";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import chatService from "../chat-service";
import {
  defaultAImessage,
  defaultToolMessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { ISlackMessage } from "@/lib/types/slack-api";
import { IAgent } from "@/lib/types/agent";
import { IExternalIds } from "@/lib/types/person";
import peopleService from "../people-service";
import { v4 } from "uuid";
import channelService from "../channel-service";
import { IChannelProvider } from "@/lib/types/channel";
import slackService from "./slack-service";
import z from "zod";
import actionService from "../action-service";
import { IAction } from "@/lib/types/actions";
import { executeAPIAction } from "@/lib/utils/api-actions-utils";
import { getCustomTools } from "@/lib/utils";

class SlackBotService {
  ERROR_MESSAGE = "Something went wrong";
  UNABLE_RESOLVE_AGENT_MESSAGE = "Unable to resolve agent";

  async generateResponse(
    slackMsg: ISlackMessage,
    teamId: string,
    userId: string,
    channel: "slack"
  ) {
    try {
      // Resolve the SuperCX AI agent ID
      const aid = await channelService.resolveAgent(teamId, channel);
      console.log("resolved agent: ", aid);

      if (!aid) throw this.UNABLE_RESOLVE_AGENT_MESSAGE;

      const agent = await agentService.fetchAgent(aid);
      if (!agent) throw this.ERROR_MESSAGE;

      let session = await this.getOrCreateSession({
        userId,
        channelId: slackMsg.channel,
        agent,
        channel,
        teamId,
      });

      const query = slackMsg.text ?? "";
      const userMsg = defaultUserMessage(query, slackMsg.id);

      const slackHistory = await slackService.getLastMentionedMessages(
        slackMsg.channel,
        teamId,
        10
      );
      // Save user message
      chatService.saveMessage(agent.id, session.id, userMsg);

      // Prepare messages for AI
      const chatHistory: IChatMessage[] = [
        {
          id: v4(),
          role: "system",
          metadata: { createdAt: new Date().toISOString() },
          parts: [{ type: "text", text: `PersonID: ${session.personId}` }],
        },
        ...session.messages,
        userMsg,
      ];
      const messages = convertToModelMessages(chatHistory);

      const model = getModel(agent);
      const systemPrompt = await getSystemPrompt(agent, query, channel);
      const actions = await actionService.getActions(agent.wid);
      const customTools = getCustomTools(actions);
      const result = await generateText({
        model,
        system: `
         ${systemPrompt},

        This following is Slack's channel conversation history use it if you find it useful
        ${slackHistory}

        always use searchKnowledge tool to search knowledgebase in all responses
        `,
        // TODO: Want to improve the prompt

        messages,
        stopWhen: stepCountIs(5),
        tools: {
          ...customTools,
          collectInformation: collectInformation(
            agent.wid,
            agent.id,
            session.id,
            "slack",
            teamId
          ),
          searchKnowledge: searchKnowledge(agent.wid, agent),
        },
      });
      console.log("result.text: ", result.text);

      console.log(
        "result: ",
        result.steps.map((step) => step.toolCalls)
      );
      // console.log(
      //   "result toolResults: ",
      //   result.steps.map((step) => step.toolResults)
      // );

      const toolCalls = result.steps.flatMap((step) => step.toolCalls);

      // Save AI message with proper message parts type consistency
      const aiMsg: IChatMessage = {
        ...defaultAImessage(result.text),
        parts: [
          ...toolCalls.map((call) => defaultToolMessage(call)).filter(Boolean), // filter out undefined/null
          ...defaultAImessage(result.text).parts,
        ] as IChatMessage["parts"], // type cast to satisfy exact expected shape
      };

      chatService.saveMessage(agent.id, session.id, aiMsg);

      console.log("ai response: ", result.text);
      return { success: true, message: result.text };
    } catch (error) {
      console.log("error: ", error);
      return { success: false, message: this.ERROR_MESSAGE };
    }
  }

  async getOrCreateSession({
    userId,
    channelId,
    agent,
    channel,
    teamId,
  }: {
    userId: string;
    channelId: string;
    agent: IAgent;
    channel: "slack";
    teamId: string;
  }) {
    // Create a unique session ID combining user and channel
    const sessionId = `${userId}_${channelId}`;

    let session = await chatService.getSessionByProviderId(sessionId, agent.id);
    if (session) return session;

    // Get user info from Slack
    let userInfo;
    try {
      userInfo = await slackService.getUserInfo(userId, teamId);

      console.log("userinfo: ", userInfo);
    } catch (error) {
      console.warn("Could not fetch Slack user info:", error);
      userInfo = { real_name: "Slack User", profile: { email: "" } };
    }

    const email = userInfo.profile?.email;
    const name = userInfo.real_name || userInfo.name || "Slack User";
    const externalIds: IExternalIds = [{ provider: channel, id: userId }];

    let { existing, person } = await peopleService.identify({
      wid: agent.wid,
      emails: email ? [email] : [],
      externalIds,
      name,
    });

    let personData = person;

    if (!existing || !personData) {
      personData = await peopleService.create2({
        wid: agent.wid,
        emails: email ? [email] : [],
        phones: [],
        externalIds,
        name,
      });
    }

    session = await chatService.createSlackSession(
      agent.wid,
      agent.id,
      sessionId,
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

const slackBotService = new SlackBotService();
export default slackBotService;
