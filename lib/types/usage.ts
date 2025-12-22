import { v4 } from "uuid";

export type UsageEventType = "chat_response" | "tool_call";
export interface IUsage {
  id: string;
  wid: string;
  aid: string;
  sessionId: string;
  eventType: UsageEventType;
  amount: number;
  metadata: IUsageMetadata;
  createdAt: string;
}
export interface IUsageMetadata {
  model: string;
  tokenUsage: number;
}

export const defaultUsage = (
  wid: string,
  aid: string,
  sessionId: string,
  eventType?: UsageEventType
) => {
  return {
    id: v4(),
    wid,
    aid,
    sessionId,
    eventType: eventType || "chat_response",
    amount: 0,
    metadata: {
      model: "",
      tokenUsage: 0,
    },
    createdAt: new Date().toISOString(),
  };
};
