import { v4 } from "uuid";
import { generateDefaultSystemPrompt } from "@/prompts/system-prompt";
import { IWorkspace } from "./workspace";
export type AgentTrainingStatus = "pending" | "trained";
export interface IAgent {
  id: string;
  wid: string;
  customization: IAgentChatCustomization;
  channels: string[];
  settings: IAgentSettings;
  knowledgeFolders: string[];
  ownerId: string;
  trainingStatus?: AgentTrainingStatus;
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
  starterMessagesEnabled: boolean;
  starterMessages: string[];
  requiresInfo: {
    active: boolean;
    nameEmail: boolean;
    phone: boolean;
  };
}

export const generateDefaultAgent = (
  wid: string,
  name: string,
  workspace: IWorkspace,
): IAgent => {
  const id = v4();
  return {
    id: id,
    wid: wid,
    ownerId: workspace.ownerId,
    channels: [],
    knowledgeFolders: workspace.folders.map((folder) => folder.id),
    customization: {
      name: name,
      greetingMessage: "Hey 👋! \n\n How can I help you today?",
      botIcon:
        workspace.info.logo ||
        "https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/magicalcx-star-logo-transparent.png?alt=media&token=9359724b-68de-4b6c-b5ea-a66235a79ab1",
      primaryColor: workspace.info.primaryColor || "#000000",
      starterMessagesEnabled: false,
      starterMessages: [],
      requiresInfo: {
        active: false,
        nameEmail: true,
        phone: false,
      },
    },
    settings: {
      temperature: 0.5,
      model: "gemini-3-pro-preview",
      systemPrompt: generateDefaultSystemPrompt(
        workspace.name,
        ` 
        ${workspace.oneLiner}
        Description: ${workspace.info.description}
        Tagline: ${workspace.info.tagline}
        Business Type: ${workspace.info.businessType}
        Industry: ${workspace.info.industry}
        Target Audience: ${workspace.info.targetAudience}
        Tone Guidelines: ${workspace.info.toneGuidelines}
        Offerings: ${workspace.info.offerings}
        Differentiators: ${workspace.info.differentiators}

        `,
      ),
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
};
