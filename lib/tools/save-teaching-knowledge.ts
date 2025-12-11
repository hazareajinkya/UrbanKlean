import { tool, generateObject } from "ai";
import { latency } from "../utils";
import z from "zod";
import { google } from "@ai-sdk/google";
import folderService from "../services/folder-service";
import knowledgeService from "../services/knowledge-service";
import { v4 } from "uuid";

export const saveTeachKnowledge = (wid: string) =>
  tool({
    name: "Save training knowledge",
    description: "Save structured training knowledge (title + description)",
    inputSchema: z.object({
      title: z
        .string()
        .describe("Max three words title for the knowledge entry"),
      description: z.string().describe("Detailed training knowledge to save"),
    }),
    execute: async ({ title, description }) => {
      latency.start();

      try {
        const content = `${title}: ${description}`;

        // Identify folder using AI
        const folderResult = await identifyFolderForContent(
          wid,
          content,
          title
        );

        const teachId = v4();

        const { chunkSize, points } =
          await knowledgeService.s_embedTeachContent(
            wid,
            folderResult.folderId,
            teachId,
            description
          );

        // Save the teach knowledge
        await knowledgeService.s_saveTeachKnowledge(
          wid,
          folderResult.folderId,
          teachId,
          title,
          description,
          points,
          chunkSize
        );

        latency.end();
        return {
          title: "Training knowledge saved",
          description: `Saved knowledge: ${title}`,
          folderId: folderResult.folderId,
          folderName: folderResult.folderName,
        };
      } catch (error: any) {
        console.error("Error saving teaching knowledge:", error);
        latency.end();
        throw new Error(`Failed to save teaching knowledge: ${error.message}`);
      }
    },
  });

const identifyFolderForContent = async (
  wid: string,
  content: string,
  context?: string
) => {
  const folders = await folderService.getFolders(wid);

  if (folders.length === 0) {
    const defaultFolder = await folderService.createFolder(wid, "General");
    return {
      folderId: defaultFolder.id,
      folderName: defaultFolder.name,
      reason: "No folders exist, created a default General folder",
    };
  }

  const folderInfo = folders.map((f) => ({
    id: f.id,
    name: f.name,
  }));

  const model = google("gemini-2.5-flash");

  const result = await generateObject({
    model,
    schema: z.object({
      folderId: z.string().describe("The ID of the best matching folder"),
      folderName: z.string().describe("The name of the best matching folder"),
    }),
    prompt: `You are a content categorization assistant. Based on the content provided, identify which folder it should be stored in.

          Available folders:
          ${JSON.stringify(folderInfo, null, 2)}

          Content to categorize:
          ${content}

          Select the most appropriate folder for this content. If no folder seems like a good match, select the one that is most general or could serve as a catch-all "Miscellaneous".

          Return the folder ID and name.`,
  });

  return {
    folderId: result.object.folderId,
    folderName: result.object.folderName,
  };
};
