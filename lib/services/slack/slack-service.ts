import axios from "axios";
import channelService from "../channel-service";
import { slackconf } from "@/lib/utils/conf";
import { slackClient } from "@/lib/clients/axios-client";

class SlackService {
  private baseURL = slackconf.baseURL;

  async sendMessage(channel: string, text: string, teamId: string) {
    try {
      // Get the channel configuration to get the access token
      const channelConfig = await channelService.getChannelDirectly(teamId);

      if (!channelConfig) {
        throw new Error(
          `No Slack channel configuration found for team ${teamId}`
        );
      }

      const accessToken = channelConfig.credentials.access_token;

      if (!accessToken) {
        throw new Error("No access token found for Slack channel");
      }
      const response = await slackClient.post(
        `/chat.postMessage`,
        { channel: channel, text: text },

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`${response.data}`);
      }

      console.log(`Slack message sent with timestamp: ${response.data.ts}`);
      return response.data.ts;
    } catch (error) {
      console.error("Error sending Slack message:", error);
      throw error;
    }
  }

  // async sendRichMessage(channel: string, blocks: any[], teamId: string) {
  //   try {
  //     const channelConfig = await channelService.getChannelByProviderId(
  //       teamId,
  //       "slack"
  //     );

  //     if (!channelConfig) {
  //       throw new Error(
  //         `No Slack channel configuration found for team ${teamId}`
  //       );
  //     }

  //     const accessToken = channelConfig.credentials.access_token;

  //     if (!accessToken) {
  //       throw new Error("No access token found for Slack channel");
  //     }

  //     const response = await axios.post(
  //       `${this.baseURL}/chat.postMessage`,
  //       {
  //         channel: channel,
  //         blocks: blocks,
  //         as_user: false,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (!response.data.ok) {
  //       throw new Error(`Slack API error: ${response.data.error}`);
  //     }

  //     console.log(
  //       `Slack rich message sent with timestamp: ${response.data.ts}`
  //     );
  //     return response.data.ts;
  //   } catch (error) {
  //     console.error("Error sending Slack rich message:", error);
  //     throw error;
  //   }
  // }

  async getUserInfo(userId: string, teamId: string) {
    try {
      const channelConfig = await channelService.getChannelDirectly(teamId);

      if (!channelConfig) {
        throw new Error(
          `No Slack channel configuration found for team ${teamId}`
        );
      }

      const accessToken = channelConfig.credentials.access_token;

      if (!accessToken) {
        throw new Error("No access token found for Slack channel");
      }

      const response = await slackClient.get(`/users.info`, {
        params: {
          user: userId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.user;
    } catch (error) {
      console.error("Error getting Slack user info:", error);
      throw error;
    }
  }

  async getBotUserId(teamId: string) {
    try {
      const channelConfig = await channelService.getChannelDirectly(teamId);

      if (!channelConfig) {
        throw new Error(
          `No Slack channel configuration found for team ${teamId}`
        );
      }

      const accessToken = channelConfig.credentials.access_token;

      if (!accessToken) {
        throw new Error("No access token found for Slack channel");
      }

      const response = await slackClient.get(`/auth.test`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.user_id;
    } catch (error) {
      console.error("Error getting bot user ID:", error);
      throw error;
    }
  }

  async getLastMentionedMessages(
    channelId: string,
    teamId: string,
    limit: number = 8
  ) {
    try {
      const channelConfig = await channelService.getChannelDirectly(teamId);

      if (!channelConfig) {
        throw new Error(
          `No Slack channel configuration found for team ${teamId}`
        );
      }

      const accessToken = channelConfig.credentials.access_token;

      if (!accessToken) {
        throw new Error("No access token found for Slack channel");
      }

      // Get bot user ID
      const botUserId = await this.getBotUserId(teamId);
      const mentionTag = `<@${botUserId}>`;

      // Fetch conversation history
      const response = await slackClient.get(`/conversations.history`, {
        params: {
          channel: channelId,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data.ok) {
        console.log("response.data.error: ", response.data.error);
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      // Filter messages where the bot is mentioned
      const mentionMessages = response.data.messages
        .filter(
          (message: any) => message.text && message.text.includes(mentionTag)
        )
        .slice(0, limit); // Get the last 8 mentions

      return mentionMessages;
    } catch (error) {
      console.error("Error getting last mentioned messages:", error);
      throw error;
    }
  }

  // async getChannelInfo(channelId: string, teamId: string) {
  //   try {
  //     const channelConfig = await channelService.getChannelByProviderId(
  //       teamId,
  //       "slack"
  //     );

  //     if (!channelConfig) {
  //       throw new Error(
  //         `No Slack channel configuration found for team ${teamId}`
  //       );
  //     }

  //     const accessToken = channelConfig.credentials.access_token;

  //     if (!accessToken) {
  //       throw new Error("No access token found for Slack channel");
  //     }

  //     const response = await axios.get(`${this.baseURL}/conversations.info`, {
  //       params: {
  //         channel: channelId,
  //       },
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });

  //     if (!response.data.ok) {
  //       throw new Error(`Slack API error: ${response.data.error}`);
  //     }

  //     return response.data.channel;
  //   } catch (error) {
  //     console.error("Error getting Slack channel info:", error);
  //     throw error;
  //   }
  // }

  // async addReaction(
  //   channel: string,
  //   timestamp: string,
  //   name: string,
  //   teamId: string
  // ) {
  //   try {
  //     const channelConfig = await channelService.getChannelByProviderId(
  //       teamId,
  //       "slack"
  //     );

  //     if (!channelConfig) {
  //       throw new Error(
  //         `No Slack channel configuration found for team ${teamId}`
  //       );
  //     }

  //     const accessToken = channelConfig.credentials.access_token;

  //     if (!accessToken) {
  //       throw new Error("No access token found for Slack channel");
  //     }

  //     const response = await axios.post(
  //       `${this.baseURL}/reactions.add`,
  //       {
  //         channel: channel,
  //         timestamp: timestamp,
  //         name: name,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (!response.data.ok) {
  //       throw new Error(`Slack API error: ${response.data.error}`);
  //     }

  //     console.log(`Added reaction ${name} to message ${timestamp}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error adding Slack reaction:", error);
  //     throw error;
  //   }
  // }
}

const slackService = new SlackService();
export default slackService;
