import { firecrawl } from "@/lib/clients/firecrawl";
import knowledgeService from "@/lib/services/knowledge-service";
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
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { url } = await validateRequestBody(request);

    //get page content =
    const result = await firecrawl.scrape(url, {
      formats: ["markdown", "html"],
    });

    const content = (result.markdown ?? "") + (result.metadata ?? "");

    const me: IWebPropsMetadata = {
      url: (result.metadata?.url as string) ?? "",
      title: result.metadata?.title ?? "",
    };

    const { chunkSize, points } = await knowledgeService.embedWeb(
      wid,
      content,
      me
    );

    await knowledgeService.saveSingleUrlKnowledge(wid, me, points, chunkSize);

    return successResponse(
      { wid, url, status: "trained" },
      "Web embedded successfully"
    );
  } catch (error) {
    console.error("Error Training on URl ", error);

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
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) return errorResponse("URL ID is required", 400);

    await knowledgeService.deleteWebKnowledge(wid, uid);

    return successResponse({ wid, uid }, "Website deleted successfully");
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
