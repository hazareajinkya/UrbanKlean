import { backendClient } from "@/lib/clients/axios-client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) => {
    try {
        const { slug } = await context.params;
        const body = await req.json();
        const { workspaceId, callbackRedirectUrl } = body;

        if (!workspaceId) {
            return NextResponse.json(
                { error: "workspaceId is required" },
                { status: 400 }
            );
        }
        const response = await backendClient.post(`/apps/${slug}/connect`, {
            workspaceId,
            callbackRedirectUrl,
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to start connection";
        return NextResponse.json({ error: message }, { status });
    }
};
