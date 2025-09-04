import knowledgeService from "@/lib/services/knowledge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;

    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { content, tid } = await validateRequestBody(request);

    const { chunkSize, points } = await knowledgeService.embedText(
      wid,
      tid,
      content
    );

    await knowledgeService.saveText(wid, points, content, chunkSize);

    return successResponse(
      { wid, status: "trained" },
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
  tid: z.string().min(1, "Text ID is required"),
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
