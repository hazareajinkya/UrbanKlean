import knowledgeService from "@/lib/services/knowledge-service";
import folderService from "@/lib/services/folder-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { NextRequest } from "next/server";
import z from "zod";
import { v4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;

    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { content, title } = await validateRequestBody(request);

    const teachId = v4();

    const { chunkSize, points } = await knowledgeService.s_embedTeachContent(
      wid,
      folderId,
      teachId,
      content
    );

    await knowledgeService.s_saveTeachKnowledge(
      wid,
      folderId,
      teachId,
      title,
      content,
      points,
      chunkSize
    );

    return successResponse(
      { wid, folderId, teachId, status: "trained" },
      "Teach content embedded successfully"
    );
  } catch (error) {
    console.error("Error in teach embedding: ", error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.message, 400);
    }
    return serverErrorResponse(error);
  }
}

const TeachContentEmbeddingSchema = z.object({
  content: z.string().min(1, "Content is required"),
  title: z.string().min(1, "Title is required"),
});

const validateRequestBody = async (request: NextRequest) => {
  try {
    const body = await request.json();
    return TeachContentEmbeddingSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error("Failed to parse request body");
  }
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { searchParams } = new URL(request.url);
    const tid = searchParams.get("tid");
    if (!tid) return errorResponse("TeachKnowledge ID is required", 400);

    await knowledgeService.s_deleteTeachKnowledge(wid, folderId, tid);

    return successResponse(
      { wid, folderId, tid },
      "Teach knowledge deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting teach knowledge: ", error);
    return serverErrorResponse(error);
  }
}
