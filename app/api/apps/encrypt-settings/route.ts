import { encrypt } from "@/lib/utils/encryption";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
    try {
        const { settings } = await req.json();

        if (!settings || typeof settings !== "object") {
            return NextResponse.json(
                { error: "settings object is required" },
                { status: 400 }
            );
        }

        const encryptedSettings: Record<string, string> = {};
        for (const [key, value] of Object.entries(settings)) {
            if (typeof value === "string" && value.trim()) {
                encryptedSettings[key] = encrypt(value);
            } else {
                encryptedSettings[key] = value as string;
            }
        }

        return NextResponse.json({ data: { encryptedSettings } });
    } catch (error: any) {
        console.error("[api/apps/encrypt-settings] error:", error.message);
        return NextResponse.json(
            { error: "Failed to encrypt settings" },
            { status: 500 }
        );
    }
};
