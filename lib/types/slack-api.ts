export interface ISlackMessage {
  id: string;
  user: string;
  channel: string;
  text: string;
  timestamp: string;
  type: "app_mention" | "direct_message" | "slash_command";
  team: string;
  originalText: string;
  eventTs: string;
  thread_ts?: string;
  blocks?: any[];
  attachments?: any[];
}
