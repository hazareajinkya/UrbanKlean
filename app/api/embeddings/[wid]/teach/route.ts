import { db } from "@/lib/clients/firebase";
import qdClient from "@/lib/clients/qdrant-client";
import knowledgeService from "@/lib/services/knowledge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { deleteDoc, doc } from "firebase/firestore";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;

    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { content, title } = await validateRequestBody(request);

    const { chunkSize, points } = await knowledgeService.s_embedTeachContent(
      wid,
      content
    );

    await knowledgeService.s_saveTeachKnowledge(
      wid,
      title,
      content,
      points,
      chunkSize
    );

    return successResponse(
      { wid, status: "trained" },
      "Teach content embedded successfully"
    );
  } catch (error) {
    console.error("Error in text embedding: ", error);

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

export const validateRequestBody = async (request: NextRequest) => {
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
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    const { searchParams } = new URL(request.url);
    const tid = searchParams.get("tid");
    if (!tid) return errorResponse("TeachKnowledge ID is required", 400);
    const textKnowledge = await knowledgeService.getTeachKnowledge(wid, tid);
    if (!textKnowledge)
      return successResponse({ wid }, "Teach knowledge not exist");
    if (textKnowledge.points.length > 0) {
      await qdClient.delete(wid, { points: textKnowledge.points });
    }
    await deleteDoc(
      doc(db, `workspaces/${wid}/knowledge/teach/contents/${tid}`)
    );
    return successResponse({ wid }, "Teach knowledge deleted successfully");
  } catch (error) {
    console.error("Error deleting text knowledge: ", error);
    return serverErrorResponse(error);
  }
}
