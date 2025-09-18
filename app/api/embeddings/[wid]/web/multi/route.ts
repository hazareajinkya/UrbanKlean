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

    const { baseUrl, urls } = await validateRequestBody(request);

    // const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/firecrawl-webhook`;
    const webhookUrl = `https://jar-bunny-independence-limiting.trycloudflare.com/api/firecrawl-webhook`;

    const result = await firecrawl.scrape(baseUrl, {
      formats: [],
    });

    const title = result.metadata?.title ?? "";

    const docId = await knowledgeService.startedCrawl(wid, baseUrl, title);

    await firecrawl.startBatchScrape(urls, {
      webhook: {
        url: webhookUrl,
        metadata: {
          wid,
          docId,
          type: "batch_scrape",
        },
        events: ["page", "completed"],
      },
      options: { formats: ["markdown", "html"] },
    });

    return successResponse(
      { wid, urls, status: "scraping_started" },
      "Web scraping started"
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
  baseUrl: z.url("Invalid Url"),
  urls: z.array(z.url("Invalid URL")),
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
