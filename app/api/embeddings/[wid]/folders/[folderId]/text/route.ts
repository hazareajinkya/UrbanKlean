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

    const { content } = await validateRequestBody(request);

    const textId = v4();
    const { chunkSize, points } = await knowledgeService.s_embedText(
      wid,
      folderId,
      textId,
      content
    );

    await knowledgeService.s_saveText(wid, folderId, points, content, chunkSize);

    // Update folder item count
    await folderService.updateFolderItemCount(wid, folderId, "texts", 1);

    return successResponse(
      { wid, folderId, textId, status: "trained" },
      "Text embedded successfully"
    );
  } catch (error) {
    console.error("Error in text embedding: ", error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.message, 400);
    }

    return serverErrorResponse(error);
  }
}

const textEmbeddingSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

const validateRequestBody = async (request: NextRequest) => {
  try {
    const body = await request.json();
    return textEmbeddingSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error("Failed to parse request body");
  }
};

// Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { searchParams } = new URL(request.url);
    const textId = searchParams.get("textId");

    if (!textId) return errorResponse("Text ID is required", 400);

    const textKnowledge = await knowledgeService.getTextKnowledge(
      wid,
      folderId,
      textId
    );
    if (!textKnowledge)
      return successResponse({ wid, folderId }, "Text knowledge does not exist");

    if (textKnowledge.points.length > 0) {
      const qdClient = (await import("@/lib/clients/qdrant-client")).default;
      await qdClient.delete(wid, { points: textKnowledge.points });
    }

    await deleteDoc(
      doc(db, `workspaces/${wid}/folders/${folderId}/texts/${textId}`)
    );

    // Update folder item count
    await folderService.updateFolderItemCount(wid, folderId, "texts", -1);

    return successResponse(
      { wid, folderId, textId },
      "Text knowledge deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting text knowledge: ", error);
    return serverErrorResponse(error);
  }
}

