import { openai } from "@ai-sdk/openai";
import { IAgent } from "../types/agent";
import { google } from "@ai-sdk/google";
import workflowservice from "../services/workflow-service";
import {
  defaultSystemPrompt,
  identityCollectionPrompt,
} from "@/prompts/system-prompt";

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
  channel: "chat" | "whatsapp" | "instagram" | "messenger"
) => {
  const workflowstext = await retrieveWorkflow(agent.id, query);

  return `
  ${defaultSystemPrompt}

  ${channel === "chat" && identityCollectionPrompt}

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

  // ${agent.settings.systemPrompt}
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
