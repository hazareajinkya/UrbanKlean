import { openai } from "@ai-sdk/openai";
import { IAgent } from "../types/agent";
import { google } from "@ai-sdk/google";
import { gateway } from "ai";
import {
  geminiHumanPrompt,
  getRequestPromptFromHints,
  getIdentityCollectionPrompt,
} from "@/prompts/system-prompt";
import { IChannelProvider } from "../types/channel";
import { Geo } from "@vercel/functions";
import { channelPrompts } from "@/prompts/channel-prompts";
import { IWorkflow } from "../types/workflow";

export const getModel = (agent: IAgent) => {
  const id = agent.settings.model;
  if (id.startsWith("xai/")) return gateway(id);
  if (id.includes("gpt")) return openai(id);
  if (id.includes("gemini")) return google(id);
  return openai("gpt-4.1-mini");
};

export const workflowsToText = (workflows: IWorkflow[]) =>
  workflows
    .map(
      (w) =>
        `Name: ${w.name} \n Trigger: ${w.trigger} \n Instructions: ${w.instructions}`,
    )
    .join("\n\n");

const fineTuningInstructions = (
  reasoning?: string,
  improvementSuggestions?: string,
) => {
  console.log(
    (reasoning || improvementSuggestions) && "Has guidance context...........",
  );
  return `
  ## Fine-Tuning Instructions
  
  CRITICAL: Follow these steps for EVERY query:
  
  1. ALWAYS call the 'searchKnowledge' tool first with the relevant query
  2. If the tool returns relevant results, you MUST use them to construct your answer
  3. Only rely on your own reasoning or general knowledge if the tool returns no relevant information
  4. For technical, factual, or detailed queries, prioritize searching the knowledge base
  5. Never skip the search step - this is mandatory

  ${
    reasoning
      ? `
  ## Previous Reasoning Context
  
  The following reasoning has been provided from a previous analysis:
  
  ${reasoning}
  
  IMPORTANT: Use this reasoning to:
  - Refine and enhance the accuracy of your final answer
  - Improve clarity, structure, and depth of your response
  - Correct any potential misunderstandings or gaps
  - Integrate these insights naturally without repeating them verbatim
  `
      : ""
  }

  ${
    improvementSuggestions
      ? `
  ## Improvement Suggestions
  
  The following suggestions have been identified to enhance the answer quality:
  
  ${improvementSuggestions}
  
  ACTION REQUIRED: Apply these improvements by:
  - Addressing any gaps or missing information highlighted
  - Enhancing clarity where confusion was noted
  - Adding relevant details or examples as suggested
  - Restructuring the response if recommended
  - Ensuring all aspects of the question are fully covered
  `
      : ""
  }
  `;
};

export const getSystemPrompt = (arg: {
  agent: IAgent;
  workflows: IWorkflow[];
  channel: IChannelProvider;
  personId?: string;
  geo?: Geo;
  isFinetuning?: boolean;
  reasoning?: string;
  suggestion?: string;
  name?: string;
  email?: string;
}) => {
  const {
    agent,
    workflows,
    channel,
    personId,
    geo,
    isFinetuning,
    reasoning,
    suggestion,
    name,
    email,
  } = arg;
  const workflowsText = workflowsToText(workflows);
  const geoInfo = geo ? getRequestPromptFromHints(geo) : "";
  const requiresInfo = agent.customization.requiresInfo ?? {
    active: true,
    nameEmail: true,
    phone: false,
  };
  const identityCollectionPrompt =
    !personId && channel === "web" && !isFinetuning && requiresInfo.active
      ? getIdentityCollectionPrompt({
          requireNameEmail: requiresInfo.nameEmail,
          requirePhone: requiresInfo.phone,
        })
      : "";

  return `${geminiHumanPrompt}
  ${!isFinetuning && geoInfo}
  ${agent.settings.systemPrompt}
  ${identityCollectionPrompt}
  ${isFinetuning ? fineTuningInstructions(reasoning, suggestion) : ""}
  ${channel === "whatsapp" && channelPrompts.whatsapp}
  ${channel === "email" && channelPrompts.email}
  ${channel === "messenger" && channelPrompts.messenger}
  ${channel === "instagram" && channelPrompts.instagram}
  ${channel === "web" && channelPrompts.web}

  These are workflow that u should keep in mind 
  There's trigger when u feel like that trigger statisfy then follow the instructions
  - Available Workflow: ${workflowsText}
  PREFER WORKFLOW OVER ANYTHING EVEN TOOL IF IT STATSIFY IN WORKFLOW FOLLOW THAT ONLY

  ## Context
  - Channel:${channel}
  ${name ? `- Name:${name}` : ""}
  ${email ? `- Email:${email}` : ""}
`;
};
