import { openai } from "@ai-sdk/openai";
import { IAgent } from "../types/agent";
import { google } from "@ai-sdk/google";
import workflowservice from "../services/workflow-service";
import {
  coreSystemPrompt,
  identityCollectionPrompt,
} from "@/prompts/system-prompt";
import { IChannelProvider } from "../types/channel";

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
  isFinetuning?: boolean,
  reasoning?: string
) => {
  const workflowstext = await retrieveWorkflow(agent.id, query);

  return `
  ${agent.settings.systemPrompt}

  ${coreSystemPrompt}

  ${!personId && channel === "web" && !isFinetuning && identityCollectionPrompt}

  ${isFinetuning ? fineTuningInstructions(reasoning) : ""}

  ${
    channel === "email" &&
    `
    When replying as an email, ensure that your output is well-formatted for email clients:
    - Use polite greetings and formal closings (e.g., "Hello," and "Best regards,").
    - Clearly organize content with paragraphs and plain text line breaks.
    - If referencing the user's inquiry, include context from their message as appropriate.
    - Stay concise, clear, and professional.
    - Respond directly to the points or questions raised in the email.
    - Avoid using HTML or markdown formatting unless otherwise instructed; plain text is preferred for compatibility.
    `
  }

  ${
    (channel === "instagram" || channel === "messenger") &&
    ` VERY IMPORTANT IF CHANNEL IS INSTAGRAM OR MESSENGER THEN OUTPUT TEXT LENGTH SHOULD BE LESS THAN 900 CHARACTERS `
  }

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

const fineTuningInstructions = (reasoning?: string) => {
  console.log(reasoning && "Is reasoning.........");
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
  ## Reasoning Context
  
  The following reasoning has been provided to guide your response:
  
  ${reasoning}
  
  IMPORTANT: Use this reasoning to:
  - Refine and enhance the accuracy of your final answer
  - Improve clarity, structure, and depth of your response
  - Correct any potential misunderstandings or gaps
  - Integrate these insights naturally without repeating them verbatim
  `
      : ""
  }
  `;
};
