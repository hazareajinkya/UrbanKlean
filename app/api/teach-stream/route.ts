import { searchKnowledge } from "@/lib/tools/search-knowledgebase";
import { IChatMessage } from "@/lib/types/session";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { saveTeachKnowledge } from "@/lib/tools/save-teaching-knowledge";

export const POST = async (req: Request) => {
  try {
    const {
      messages,
      wid,
    }: { messages: IChatMessage[]; wid: string; sid?: string } =
      await req.json();
    const model = google("gemini-2.5-flash");

    const prompt = `
    You can learn user rules and preferences.
    Normal question, answer normally.

    If user shares a rule, instruction, policy, preference, or says things like:
    "remember this", "from now on", "do it like this", or defines company info:

    1) DO NOT repeat their words modify it.
    2) Respond warm & friendly with variety.
    3) Check is the information in the knowledge base using calling the searchKnowledge.
    4) If there is no information about that MUST call saveTrainingKnowledge with a short clean summary other wise do nothing.
    4) Never mention you're learning.
    5) Stay kind, concise, helpful, same language as user.
    `;
    const result = streamText({
      model,
      system: prompt,
      messages: convertToModelMessages(messages),
      tools: {
        saveTrainingKnowledge: saveTeachKnowledge(wid),
        searchKnowledge: searchKnowledge(wid),
      },
      stopWhen: stepCountIs(5),
      onError: (error) => {
        console.error("Error: ", (error.error as any).response, error);
      },
    });
    return result.toUIMessageStreamResponse({});
  } catch (error: any) {
    return new Response(error.message || "Error to train the agent", {
      status: 500,
    });
  }
};
