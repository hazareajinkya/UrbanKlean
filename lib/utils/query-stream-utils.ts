import { openai } from "@ai-sdk/openai";
import { IAgent } from "../types/agent";
import { google } from "@ai-sdk/google";
import workflowservice from "../services/workflow-service";
import {
  coreSystemPrompt,
  geminiHumanPrompt,
  getRequestPromptFromHints,
  identityCollectionPrompt,
} from "@/prompts/system-prompt";
import { IChannelProvider } from "../types/channel";
import { Geo } from "@vercel/functions";
import { channelPrompts } from "@/prompts/channel-prompts";

export const getModel = (agent: IAgent) => {
  let model = openai("gpt-4.1-mini");

  if (agent.settings.model.includes("gpt")) {
    model = openai(agent.settings.model);
  } else if (agent.settings.model.includes("gemini")) {
    model = google(agent.settings.model);
  }
  return model;
};

export const getSystemPrompt = async (
  agent: IAgent,
  query: string,
  channel: IChannelProvider,
  personId?: string,
  geo?: Geo,
  isFinetuning?: boolean,
  reasoning?: string,
  suggestion?: string
) => {
  const workflowstext = await retrieveWorkflow(agent.id, query);
  const geoInfo = geo ? getRequestPromptFromHints(geo) : "";
  // ${coreSystemPrompt}

  return `
  ${geminiHumanPrompt}

  ${!isFinetuning && geoInfo}


  ${agent.settings.systemPrompt}


  ${!personId && channel === "web" && !isFinetuning && identityCollectionPrompt}

  ${isFinetuning ? fineTuningInstructions(reasoning, suggestion) : ""}

  ${channel === "whatsapp" && channelPrompts.whatsapp}
  ${channel === "email" && channelPrompts.email}
  ${channel === "messenger" && channelPrompts.messenger}
  ${channel === "instagram" && channelPrompts.instagram}


  These are workflow that u should keep in mind 
  There's trigger when u feel like that trigger statisfy then follow the instructions

  - Available Workflow: ${workflowstext}

  PREFER WORKFLOW OVER ANYTHING EVEN TOOL IF IT STATSIFY IN WORKFLOW FOLLOW THAT ONLY

  ## Context
  - Channel:${channel}


`;
};

export const retrieveWorkflow = async (aid: string, query: string) => {
  const workflows = await workflowservice.getWorkflows(aid);
  const workflowstext = workflows
    .map(
      (w) =>
        `Name: ${w.name} \n Trigger: ${w.trigger} \n Instructions: ${w.instructions}`
    )
    .join("\n\n");

  return workflowstext;
};

const fineTuningInstructions = (
  reasoning?: string,
  improvementSuggestions?: string
) => {
  console.log(
    (reasoning || improvementSuggestions) && "Has guidance context..........."
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
