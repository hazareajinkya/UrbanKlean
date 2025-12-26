import { UIMessage } from "@ai-sdk/react";
import { v4 } from "uuid";
import { IChannelProvider } from "./channel";
import {
  DynamicToolCall,
  Tool,
  ToolCallOptions,
  ToolSet,
  TypedToolCall,
  UIDataTypes,
  UIMessagePart,
  UITools,
} from "ai";
import z from "zod";
import type { Geo } from "@vercel/functions";

export interface ISession {
  id: string;
  aid: string;
  wid: string;
  geo?: Geo;
  personId?: string;
  providerId: string;
  channel: IChannelProvider;
  status: "open" | "closed";
  messages: IChatMessage[];
  usage?: {
    tokens: number;
    credits: number;
  };

  fromPage?: string;
  createdAt: string;
  updatedAt: string;
  chatSummary?: {
    questionUseAsked: string[];
    summary: string;
    tags: string[];
    insights: string[];
    interests: string[];
    resolutionStatus: "resolved" | "unresolved";
    customerIntent: string;
    sentiment: "positive" | "neutral" | "negative";
    actionsTaken: string[];
    followUpRequired: boolean;
    isSuspicious: boolean;
    suspiciousType:
      | "none"
      | "phishing"
      | "social_engineering"
      | "impersonation"
      | "data_harvesting"
      | "other";
    riskLevel: "none" | "low" | "medium" | "high" | "critical";
    agentNotes: string | undefined;
  };
}

export interface ITraingSession {
  id: string;
  wid: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const dataPartSchema = z.object({
  type: z.literal("data"),
  data: z.any(),
});

const metadataSchema = z.object({
  creditCost: z.number().optional(),
  tokenUsage: z.number().optional(),
  model: z.string().optional(),
  createdAt: z.string(),
});

type MyMetadata = z.infer<typeof metadataSchema>;
type MyDataPart = z.infer<typeof dataPartSchema>;

export type IChatMessage = UIMessage<MyMetadata, MyDataPart, UITools>;

export const generateDefaultSession = (
  wid: string,
  aid: string,
  channel: IChannelProvider,
  pid?: string,
  id?: string,
  fromPage?: string
): ISession => {
  return {
    id: id ?? v4(),
    aid,
    wid,
    channel,
    status: "open",
    providerId: pid || "",
    messages: [],
    ...(fromPage && { fromPage }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const defaultAImessage = (msg: string): IChatMessage => {
  return {
    id: v4(),
    role: "assistant",
    metadata: {
      createdAt: new Date().toISOString(),
    },
    parts: [
      {
        type: "text",
        text: msg,
      },
    ],
  };
};

export const defaultToolMessage = (call: {
  toolCallId: string;
  toolName: string;
  input: any;
  output?: any;
}): UIMessagePart<UIDataTypes, UITools> => {
  return {
    type: "dynamic-tool",
    toolCallId: call.toolCallId,
    toolName: call.toolName,
    state: "output-available",
    input: call.input,
    output: call.output,
  };
};
export const defaultUserMessage = (msg: string, id?: string): IChatMessage => {
  return {
    id: id ?? v4(),
    role: "user",
    metadata: {
      createdAt: new Date().toISOString(),
    },
    parts: [
      {
        type: "text",
        text: msg,
      },
    ],
  };
};

export const defaultDataMessage = (data: any, id?: string): IChatMessage => {
  return {
    id: id ?? v4(),
    role: "system",
    metadata: {
      createdAt: new Date().toISOString(),
    },
    parts: [
      {
        type: "data-data",
        data: data,
      },
    ],
  };
};

export const generateDefaultTeachSession = (
  wid: string,
  id?: string
): ITraingSession => {
  return {
    id: id ?? v4(),
    wid,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// export interface IChatMessage extends UIMessage {
//   metadata: {
//     createdAt: string;
//   };
// }
