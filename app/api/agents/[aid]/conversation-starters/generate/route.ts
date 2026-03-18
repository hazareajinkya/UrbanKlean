import { NextRequest } from "next/server";
import { backendClient } from "@/lib/clients/axios-client";
import { successResponse, errorResponse } from "@/lib/types/api-response";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ aid: string }> }
) {
    try {
        const { aid } = await params;

        if (!aid) {
            return errorResponse("Agent ID is required", 400);
        }

        const { data } = await backendClient.post(
            `/agents/${aid}/conversation-starters/generate`
        );

        return successResponse(data.data);
    } catch (error: any) {
        console.error(
            "[conversation-starters/generate] Error:",
            error?.response?.data || error
        );
        return errorResponse(
            error?.response?.data?.message || "Failed to generate conversation starters",
            error?.response?.status || 500
        );
    }
}
