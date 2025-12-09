import { firecrawl } from "@/lib/clients/firecrawl";
import knowledgeService from "@/lib/services/knowledge-service";
import folderService from "@/lib/services/folder-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { IWebPropsMetadata } from "@/lib/types/knowledge";
import { NextRequest } from "next/server";
import { v4 } from "uuid";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { url } = await validateRequestBody(request);

    //get page content
    const result = await firecrawl.scrape(url, {
      formats: ["markdown", "html"],
    });

    const content = (result.markdown ?? "") + (result.metadata ?? "");

    const me: IWebPropsMetadata = {
      url: (result.metadata?.url as string) ?? "",
      title: result.metadata?.title ?? "",
    };

    const websiteId = v4();
    const { chunkSize, points } = await knowledgeService.s_embedWeb(
      wid,
      folderId,
      websiteId,
      content,
      me
    );

    await knowledgeService.s_saveSingleUrlKnowledge(
      wid,
      folderId,
      me,
      points,
      chunkSize
    );

    return successResponse(
      { wid, folderId, websiteId, url, status: "trained" },
      "Web embedded successfully"
    );
  } catch (error) {
    console.error("Error Training on URL ", error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.message, 400);
    }
    return serverErrorResponse(error);
  }
}

const webEmbeddingSchema = z.object({
  url: z.url("Invalid URL"),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) return errorResponse("URL ID is required", 400);

    await knowledgeService.s_deleteWebKnowledge(wid, folderId, uid);

    return successResponse(
      { wid, folderId, uid },
      "Website deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting website: ", error);
    return serverErrorResponse(error);
  }
}

const validateRequestBody = async (request: NextRequest) => {
  try {
    const body = await request.json();
    return webEmbeddingSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error("Failed to parse request body");
  }
};
