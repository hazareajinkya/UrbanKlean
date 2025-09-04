import { v4 } from "uuid";
import { getRandomAvatar } from "../utils";

export interface IAgent {
  id: string;
  wid: string;

  customization: IAgentChatCustomization;
  settings: IAgentSettings;
  createdAt: string;
  updatedAt: string;
}

export interface IAgentSettings {
  temperature: number;
  model: string;
  systemPrompt: string;
}

export interface IAgentChatCustomization {
  name: string;
  greetingMessage: string;
  botIcon: string;
  primaryColor: string;
}

export const generateDefaultAgent = (wid: string, name: string): IAgent => {
  const id = v4();
  return {
    id: id,
    wid: wid,

    customization: {
      name: name,
      greetingMessage: "Hello, how can I help you today?",
      botIcon: getRandomAvatar(),
      primaryColor: `#1e40ff`,
    },
    settings: {
      temperature: 0.5,
      model: "gpt-4.1-mini",
      systemPrompt: "",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
