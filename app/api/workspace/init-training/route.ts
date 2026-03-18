import { NextRequest } from "next/server";
import z from "zod";
import { backendClient } from "@/lib/clients/axios-client";
import { errorResponse, successResponse } from "@/lib/types/api-response";

const initWorkspaceTrainingSchema = z.object({
  wid: z.string().min(1, "Workspace id is required"),
  url: z.string().url("URL must start with http:// or https://"),
});

export async function POST(request: NextRequest) {
  try {
    const { wid, url } = initWorkspaceTrainingSchema.parse(await request.json());
    const { data } = await backendClient.post(`/workspaces/${wid}/init-training`, {
      url,
    });
    if (!data?.success) {
      return errorResponse(data?.error?.message || "Failed to init training", 500);
    }
    return successResponse(data.data, "Workspace training initialized successfully");
  } catch (error: any) {
    console.error("[workspace/init-training] Error:", error?.response?.data || error);
    return errorResponse(
      error?.response?.data?.message || error?.message || "Failed to init training",
      error?.response?.status || 500,
    );
  }
}
