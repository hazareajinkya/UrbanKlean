import { UIMessage } from "@ai-sdk/react";
import { v4 } from "uuid";

export interface ISession {
  id: string;
  aid: string;
  wid: string;
  channel: "web" | "whatsapp";
  status: "open" | "closed";
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage extends UIMessage {}

export const generateDefaultSession = (wid: string, aid: string): ISession => {
  return {
    id: v4(),
    aid,
    wid,
    channel: "web",
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
    parts: [
      {
        type: "text",
        text: msg,
      },
    ],
  };
};

export const defaultUserMessage = (msg: string): IChatMessage => {
  return {
    id: v4(),
    role: "user",
    parts: [
      {
        type: "text",
        text: msg,
      },
    ],
  };
};
