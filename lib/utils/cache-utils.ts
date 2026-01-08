import { apiClient } from "@/lib/clients/axios-client";

type CacheType = "agent" | "workflows" | "actions";

/**
 * Invalidates server-side cache by calling the cache API route.
 * Fire-and-forget - doesn't throw errors to avoid blocking mutations.
 */
export const invalidateCache = async (arg: {
  type: CacheType;
  id: string;
}): Promise<void> => {
  const { type, id } = arg;
  try {
    await apiClient.post("/api/cache", { type, id });
  } catch (error) {
    // Log but don't throw - cache invalidation shouldn't block the main operation
    console.warn(`[cache] Failed to invalidate ${type}:${id}`, error);
  }
};

/**
 * Invalidates multiple cache entries in parallel.
 * Fire-and-forget - doesn't throw errors to avoid blocking mutations.
 */
export const invalidateCaches = async (
  entries: Array<{ type: CacheType; id: string }>
): Promise<void> => {
  await Promise.all(entries.map(invalidateCache));
};
