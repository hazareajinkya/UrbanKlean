import { backendClient } from "@/lib/clients/axios-client";
import shopifyService from "@/lib/services/shopify-service";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const { wid, storeId, status } = await request.json();

        await backendClient.delete(`/integrations/shopify`, {
            data: {
                wid,
                storeId,
                status
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting Shopify integration:", error);
        return NextResponse.json({ error: "Failed to delete Shopify integration" }, { status: 500 });
    }
}