import { ISlackMessage } from "@/lib/types/slack-api";

class SlackWebhookParser {
  parseAppMentionMessage(body: any): ISlackMessage | null {
    try {
      const event = body.event;

      if (event.type !== "app_mention") {
        console.log("Not an app_mention event");
        return null;
      }

      // Remove bot mention from text to get clean user message
      const cleanText = this.removeBotMention(
        event.text,
        body.authorizations?.[0]?.user_id
      );

      const message: ISlackMessage = {
        id: event.client_msg_id,
        user: event.user,
        channel: event.channel,
        text: cleanText,
        timestamp: event.ts,
        type: "app_mention",
        team: body.team_id,
        originalText: event.text,
        eventTs: event.event_ts,
      };

      return message;
    } catch (error) {
      console.error("Error parsing Slack app mention:", error);
      return null;
    }
  }

  private removeBotMention(text: string, botUserId?: string): string {
    if (!text) return "";

    // Remove @botuser mentions (e.g., "<@U1234567890>")
    let cleanText = text.replace(/<@[A-Z0-9]+>/g, "").trim();

    // Remove any leading/trailing whitespace
    return cleanText;
  }
}

const slackParser = new SlackWebhookParser();
export default slackParser;
