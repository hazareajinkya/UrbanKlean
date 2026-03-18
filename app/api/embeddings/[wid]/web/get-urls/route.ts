import { firecrawl } from "@/lib/clients/firecrawl";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/types/api-response";
import { NextRequest } from "next/server";
import folderService from "@/lib/services/folder-service";
import workspaceService from "@/lib/services/workspace-service";
import { gateway, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wid: string }> },
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
      "URL mapped successfully",
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
  }[],
) => {
  try {
    const mainContentUrlResult = await generateObject({
      model: gateway("openai/gpt-oss-120b"),
      schema: categorizeUrlSchema,
      prompt: `You are organizing a website's URLs into logical folders for a knowledge base.

        ## Task
        Categorize each URL into the most appropriate folder based on its path, title, and description.

        ## Existing Folders (prioritize these)
        ${
          folders.length > 0
            ? folders
                .map((f) => `- ID: "${f.id}" | Name: "${f.name}"`)
                .join("\n")
            : "No existing folders."
        }

        ## Categorization Rules
        1. **Match existing folders first** - If a URL fits an existing folder, use its folderId
        2. **Create new folders sparingly** - Only if no existing folder fits, create a new one with folderId: "none"
        3. **Use clear folder names** - Single or two words (e.g., About, Products, Services, Support, Blog, Careers, Legal, Resources, Pricing)
        4. **Group similar content** - URLs with similar paths or topics go together
        5. **Include a Miscellaneous folder** - For URLs that don't fit other categories

        ## URL Filtering
        EXCLUDE these types of URLs:
        - Login/authentication pages
        - 404 or error pages
        - External redirects or third-party links
        - Ads, tracking, or utility endpoints
        - URLs with no meaningful content

        INCLUDE only URLs with actual company/product information.

        ## URLs to Categorize
        ${JSON.stringify(
          urls.map((u) => ({
            url: u.url,
            ...(u.title && { title: u.title }),
            ...(u.description && { description: u.description }),
            ...(u.category && { hint: u.category }),
          })),
          null,
          2,
        )}`,
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
      .describe("The folder ID that best matches this group of URLs")
      .or(z.literal("none")),
    folderName: z
      .string()
      .describe("The folder name that best matches this group of URLs"),
    url: z
      .array(z.string())
      .describe("List of URLs categorized into this folder"),
  }),
);
