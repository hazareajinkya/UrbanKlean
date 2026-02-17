import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { identifyFolderForContent } from "@/lib/tools/save-teaching-knowledge";
import knowledgeService from "@/lib/services/knowledge-service";
import { NextRequest } from "next/server";
import z from "zod";
import { v4 } from "uuid";

const SaveKnowledgeSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  title: z.string().min(1, "Max three words title for the knowledge entry"),
  description: z.string().min(1, "Detailed training knowledge to save"),
});

const validateRequestBody = async (request: NextRequest) => {
  const body = await request.json();
  return SaveKnowledgeSchema.parse(body);
};

export async function POST(request: NextRequest) {
  try {
    const { wid, title, description } = await validateRequestBody(request);
    const content = `${title}: ${description}`;
    const folderResult = await identifyFolderForContent(wid, content, title);
    const teachId = v4();
    const { chunkSize, points } = await knowledgeService.s_embedTeachContent(
      wid,
      folderResult.folderId,
      teachId,
      description,
    );
    await knowledgeService.s_saveTeachKnowledge(
      wid,
      folderResult.folderId,
      teachId,
      title,
      description,
      points,
      chunkSize,
    );
    return successResponse(
      {
        title: "Training knowledge saved",
        description: `Saved knowledge: ${title}`,
        folderId: folderResult.folderId,
        folderName: folderResult.folderName,
      },
      "Training knowledge saved",
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        Object.values(error.flatten().fieldErrors).join(", "),
        400,
      );
    }
    console.error("Error saving teaching knowledge:", error);
    return serverErrorResponse(error as Error);
  }
}
