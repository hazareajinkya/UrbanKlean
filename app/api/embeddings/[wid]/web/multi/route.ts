import { firecrawl } from "@/lib/clients/firecrawl";
import knowledgeService from "@/lib/services/knowledge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";
import { v4 } from "uuid";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  const { TUNNEL_URL, NODE_ENV, NEXT_PUBLIC_BASE_URL } = process.env;
  const tunnelOrigin =
    NODE_ENV === "production" ? NEXT_PUBLIC_BASE_URL : TUNNEL_URL;

  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { urls: urlObjects, workspaceType } = await validateRequestBody(
      request
    );

    const targetUrls: string[] = [];
    const urlMetadata: Record<
      string,
      { folderId: string; knowledgeId: string }
    > = {};

    await Promise.all(
      urlObjects.map(async (obj) => {
        const title = new URL(obj.url).hostname;
        const knowledgeId = await knowledgeService.s_createPendingWebKnowledge(
          wid,
          obj.folderId,
          obj.url,
          title
        );

        targetUrls.push(obj.url);
        urlMetadata[obj.url] = {
          folderId: obj.folderId,
          knowledgeId,
        };
      })
    );

    const webhookUrl = `${tunnelOrigin}/api/firecrawl-webhook`;
    const batchId = v4();

    await firecrawl.startBatchScrape(targetUrls, {
      webhook: {
        url: webhookUrl,
        metadata: {
          wid,
          urlMetadata: JSON.stringify(urlMetadata),
          batchId,
          type: "batch_scrape",
          workspaceType,
        },
        events: ["page", "completed"],
      },
      options: { formats: ["markdown", "html"] },
    });

    return successResponse(
      { wid, status: "scraping_started", count: targetUrls.length },
      "Web scraping started"
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
  urls: z.array(
    z.object({
      folderId: z.string(),
      url: z.string().url("Invalid URL"),
    })
  ),
  workspaceType: z
    .enum(["onboarding", "default"])
    .optional()
    .default("default"),
});

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
