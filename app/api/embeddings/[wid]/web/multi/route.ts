import { firecrawl } from "@/lib/clients/firecrawl";
import knowledgeService from "@/lib/services/knowledge-service";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { IWebPropsMetadata } from "@/lib/types/knowledge";
import { AxiosError } from "axios";
import { NextRequest } from "next/server";
import { v4 } from "uuid";
import z from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  const { TUNNEL_URL, NODE_ENV, NEXT_PUBLIC_BASE_URL } = process.env;
  console.log("TUNNEL_URL: ", TUNNEL_URL);
  console.log("NODE_ENV: ", NODE_ENV);
  console.log("NEXT_PUBLIC_BASE_URL: ", NEXT_PUBLIC_BASE_URL);
  const tunnelOrigin =
    NODE_ENV === "production" ? NEXT_PUBLIC_BASE_URL : TUNNEL_URL;

  try {
    const { wid } = await params;
    if (!wid) return errorResponse("Workspace ID is required", 400);

    const { baseUrl, urls, workspaceType } = await validateRequestBody(request);

    // const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/firecrawl-webhook`;
    const webhookUrl = `${tunnelOrigin}/api/firecrawl-webhook`;

    const result = await firecrawl.scrape(baseUrl, {
      formats: [],
    });

    const title = result.metadata?.title ?? "";

    const docId = await knowledgeService.s_startedCrawl(wid, baseUrl, title);
    console.log("webhookUrl: ", webhookUrl);

    await firecrawl.startBatchScrape(urls, {
      webhook: {
        url: webhookUrl,
        metadata: {
          wid,
          docId,
          type: "batch_scrape",
          workspaceType,
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
