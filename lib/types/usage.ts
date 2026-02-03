import { v4 } from "uuid";

export type UsageEventType =
  | "chat_response"
  | "tool_call"
  | "credit_purchase"
  | "credit_renewal";
export interface IUsage {
  id: string;
  wid: string | null;
  aid: string | null;
  sessionId: string | null;
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
  wid?: string,
  aid?: string,
  sessionId?: string,
  eventType?: UsageEventType,
) => {
  return {
    id: v4(),
    wid: wid ?? null,
    aid: aid ?? null,
    sessionId: sessionId ?? null,
    eventType: eventType || "chat_response",
    amount: 0,
    metadata: {
      model: "",
      tokenUsage: 0,
    },
    createdAt: new Date().toISOString(),
  };
};
