import { backendClient } from "@/lib/clients/axios-client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
            const redirectUrl = `${baseUrl}/workspaces?connectStatus=error&error=${encodeURIComponent(errorDescription || error)}`;
            return NextResponse.redirect(redirectUrl);
        }

        if (!code || !state) {
            return NextResponse.json(
                { error: "Missing code or state" },
                { status: 400 }
            );
        }

        const backendCallbackUrl = `/apps/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

        const response = await backendClient.get(backendCallbackUrl, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
        });
        if (response.status >= 300 && response.status < 400 && response.headers.location) {
            return NextResponse.redirect(response.headers.location);
        }
        const data = response.data?.data || response.data;
        if (data?.callbackRedirectUrl) {
            const params = new URLSearchParams({
                connectStatus: data.status || "connected",
                appSlug: data.appSlug || "",
                workspaceId: data.workspaceId || "",
            });
            return NextResponse.redirect(`${data.callbackRedirectUrl}?${params.toString()}`);
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        return NextResponse.redirect(
            `${baseUrl}/workspaces?connectStatus=${data?.status || "connected"}&appSlug=${data?.appSlug || ""}`
        );
    } catch (error: any) {
        if (error?.response?.status >= 300 && error?.response?.status < 400 && error?.response?.headers?.location) {
            return NextResponse.redirect(error.response.headers.location);
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const message = error?.response?.data?.message || error.message || "OAuth callback failed";
        return NextResponse.redirect(
            `${baseUrl}/workspaces?connectStatus=error&error=${encodeURIComponent(message)}`
        );
    }
};
