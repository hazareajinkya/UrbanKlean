import agentService from "@/lib/services/agent-service";
import actionService from "@/lib/services/action-service";
import workflowService from "@/lib/services/workflow-service";
import { generateText, stepCountIs, tool, ToolSet } from "ai";
import { z } from "zod";
import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import { executeAPIAction } from "@/lib/utils/api-actions-utils";
import { getModel, getSystemPrompt } from "@/lib/utils/query-stream-utils";
import { IAction } from "@/lib/types/actions";
import { errorResponse, successResponse } from "@/lib/types/api-response";

export async function POST(req: Request) {
  try {
    const { aid, question, reasoning, suggestion }: { aid: string; question: string; reasoning?: string; suggestion?: string } = await req.json();

    const agent = await agentService.fetchAgent(aid);
    if (!agent) return errorResponse("Agent not found", 404);

    const workflows = await workflowService.getWorkflows(aid);
    const model = getModel(agent);
    const actions = await actionService.getActionsForWorflows(agent.wid, workflows);
    const customTools = getCustomTools(actions);
    const systemPrompt = getSystemPrompt({ agent, workflows, channel: "web", isFinetuning: true, reasoning, suggestion });

    const tools = {
      ...customTools,
      searchKnowledge: searchKnowledge(agent.wid, agent),
    };

    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      stopWhen: stepCountIs(5),
      tools,
    });

    return successResponse({ answer: result.text });
  } catch (error: any) {
    return errorResponse(error.message || "Error processing request", 500);
  }
}

const getCustomTools = (actions: IAction[]): ToolSet => {
  return actions.reduce((acc, action) => {
    acc[action.slug] = tool({
      name: action.name,
      description: action.description,
      inputSchema: z.object({
        ...action.inputs.reduce((acc: Record<string, any>, input) => {
          acc[input.key] = z.string().describe(input.description || "");
          return acc;
        }, {} as Record<string, any>),
      }),
      execute: async (params) => {
        return executeAPIAction(action, params);
      },
    });
    return acc;
  }, {} as ToolSet);
};
