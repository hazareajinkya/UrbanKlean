import { v4 } from "uuid";
import { getRandomAvatar } from "../utils";
import { generateDefaultSystemPrompt } from "@/prompts/system-prompt";
import { IWorkspace } from "./workspace";

export interface IAgent {
  id: string;
  wid: string;
  customization: IAgentChatCustomization;
  channels: string[];
  settings: IAgentSettings;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
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

export const generateDefaultAgent = (
  wid: string,
  name: string,
  workspace: IWorkspace
): IAgent => {
  const id = v4();
  return {
    id: id,
    wid: wid,
    ownerId: workspace.ownerId,
    channels: [],
    customization: {
      name: name,
      greetingMessage: "Hello, how can I help you today?",
      botIcon:
        "https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6",
      primaryColor: `#640d5f`,
    },
    settings: {
      temperature: 0.5,
      model: "gemini-2.5-flash",
      systemPrompt: generateDefaultSystemPrompt(
        workspace.name,
        workspace.oneLiner
      ),
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
};
