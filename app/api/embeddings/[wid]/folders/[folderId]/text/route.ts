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

    const textId = v4();
    const { chunkSize, points } = await knowledgeService.s_embedText(
      wid,
      folderId,
      textId,
      content,
      title
    );

    await knowledgeService.s_saveText(
      wid,
      folderId,
      points,
      content,
      chunkSize,
      title
    );

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
  title: z.string().min(1, "Title is required"),
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

    await knowledgeService.s_deleteTextKnowledge(wid, folderId, textId);

    return successResponse(
      { wid, folderId, textId },
      "Text knowledge deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting text knowledge: ", error);
    return serverErrorResponse(error);
  }
}

export async function PUT(
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

    const { content, title } = await validateRequestBody(request);

    const { chunkSize, points } = await knowledgeService.s_embedText(
      wid,
      folderId,
      textId,
      content,
      title
    );

    await knowledgeService.s_updateTextKnowledge(
      wid,
      folderId,
      textId,
      title,
      content,
      points,
      chunkSize
    );

    return successResponse(
      { wid, folderId, textId, status: "trained" },
      "Text updated successfully"
    );
  } catch (error) {
    console.error("Error updating text knowledge: ", error);
    if (error instanceof z.ZodError) {
      return errorResponse(error.message, 400);
    }
    return serverErrorResponse(error);
  }
}
