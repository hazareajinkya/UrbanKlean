import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/types/api-response";
import cacheService from "@/lib/services/cache-service";
import { z } from "zod";

const CacheInvalidationSchema = z.object({
  type: z.enum(["agent", "workflows", "actions"]),
  id: z.string().min(1, "ID is required"),
});

export type CacheInvalidationPayload = z.infer<typeof CacheInvalidationSchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CacheInvalidationSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const { type, id } = parsed.data;

    switch (type) {
      case "agent":
        await cacheService.invalidateAgent(id);
        break;
      case "workflows":
        await cacheService.invalidateWorkflows(id);
        break;
      case "actions":
        await cacheService.invalidateActions(id);
        break;
    }

    return successResponse({ type, id }, `Cache invalidated for ${type}`);
  } catch (error: any) {
    console.error("[cache/route] Error:", error);
    return errorResponse(error.message || "Failed to invalidate cache", 500);
  }
}

