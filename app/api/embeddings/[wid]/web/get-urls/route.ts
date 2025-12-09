import { firecrawl } from "@/lib/clients/firecrawl";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) return errorResponse("URL is required", 400);

    const result = await firecrawl.map(url);
    const uniqueUrls = Array.from(new Set(result.links || []));

    return successResponse(
      { url, result: uniqueUrls },
      "URL mapped successfully"
    );
  } catch (error) {
    console.error("URL mapping failed: ", error);

    return serverErrorResponse(error);
  }
}
