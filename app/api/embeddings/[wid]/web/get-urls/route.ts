import { firecrawl } from "@/lib/clients/firecrawl";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";
import folderService from "@/lib/services/folder-service";
import workspaceService from "@/lib/services/workspace-service";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> }
) {
  try {
    const { wid } = await params;
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!wid) return errorResponse("Workspace ID is required", 400);
    if (!url) return errorResponse("URL is required", 400);

    const result = await firecrawl.map(url);
    const uniqueUrls = Array.from(new Set(result.links || []));

    const workspace = await workspaceService.fetchWorkspace(wid);
    if (!workspace) return errorResponse("Workspace not found", 404);
    const folders = workspace.folders;
    const categorizeUrlsResult = await categorizeUrls(uniqueUrls, folders);
    return successResponse(
      {
        url,
        result: categorizeUrlsResult.map((url) => ({
          folderId: url.folderId,
          folderName: url.folderName,
          urls: Array.from(new Set(url.url || [])),
        })),
      },
      "URL mapped successfully"
    );
  } catch (error) {
    console.error("URL mapping failed: ", error);

    return serverErrorResponse(error);
  }
}

const categorizeUrls = async (
  urls: {
    url: string;
    title?: string;
    description?: string;
    category?: string;
  }[],
  folders: {
    id: string;
    name: string;
  }[]
) => {
  try {
    const mainContentUrlResult = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: categorizeUrlSchema,
      prompt: `Categorize ALL input URLs (every single one) into 4-5 folders:
      folders: ${JSON.stringify(folders, null, 2)}
      Return as "categories" array with {folderId: string, urls: string[]}.
      Rules: 
      - Valid JSON only
      - Each URL once
      - No duplicate urls
      - Skip URLs with no valid content (login pages, 404s, external redirects, ads, etc.)
      - Only include URLs with actual company information
      Input:
      ${JSON.stringify(urls, null, 2)}`,
    });

    return mainContentUrlResult.object;
  } catch (error) {
    console.error("Error during identifyMainContentUrls:", error);
    throw new Error("Failed to identify main content URLs");
  }
};

export const categorizeUrlSchema = z.array(
  z.object({
    folderId: z
      .string()
      .describe("The folder ID that best matches this group of URLs"),
    folderName: z
      .string()
      .describe("The folder name that best matches this group of URLs"),
    url: z
      .array(z.string())
      .describe("List of URLs categorized into this folder"),
  })
);
