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
  { params }: { params: Promise<{ wid: string; folderId: string }> }
) {
  const { TUNNEL_URL, NODE_ENV, NEXT_PUBLIC_BASE_URL } = process.env;
  const tunnelOrigin =
    NODE_ENV === "production" ? NEXT_PUBLIC_BASE_URL : TUNNEL_URL;

  try {
    const { wid, folderId } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!folderId) return errorResponse("Folder ID is required", 400);

    const { baseUrl, urls, workspaceType } = await validateRequestBody(request);

    const webhookUrl = `${tunnelOrigin}/api/firecrawl-webhook`;

    const result = await firecrawl.scrape(baseUrl, {
      formats: [],
    });

    const title = result.metadata?.title ?? "";

    const docId = await knowledgeService.s_startedCrawl(
      wid,
      folderId,
      baseUrl,
      title
    );

    await firecrawl.startBatchScrape(urls, {
      webhook: {
        url: webhookUrl,
        metadata: {
          wid,
          folderId,
          docId,
          type: "batch_scrape",
          workspaceType,
        },
        events: ["page", "completed"],
      },
      options: { formats: ["markdown", "html"] },
    });

    return successResponse(
      { wid, folderId, urls, status: "scraping_started" },
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
  baseUrl: z.url("Invalid Url"),
  urls: z.array(z.url("Invalid URL")),
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
