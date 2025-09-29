import { UIMessage } from "@ai-sdk/react";
import { v4 } from "uuid";
import { IChannelProvider } from "./channel";

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

export interface IChatMessage extends UIMessage {
  metadata: {
    createdAt: string;
  };
}

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
