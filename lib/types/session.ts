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
export interface ISession {
  id: string;
  aid: string;
  wid: string;
  personId?: string;
  channel: IChannelProvider;
  status: "open" | "closed";
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
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
  createdAt: z.string(),
});

type MyMetadata = z.infer<typeof metadataSchema>;
type MyDataPart = z.infer<typeof dataPartSchema>;

export type IChatMessage = UIMessage<MyMetadata, MyDataPart, UITools>;

export const generateDefaultSession = (
  wid: string,
  aid: string,
  channel: IChannelProvider,
  id?: string
): ISession => {
  return {
    id: id ?? v4(),
    aid,
    wid,
    channel,
    status: "open",
    messages: [],
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
