import { NextRequest, NextResponse } from "next/server";
import channelService from "@/lib/services/channel-service";
import postmarkService from "@/lib/services/postmark/postmark-service";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wid = searchParams.get("wid");
    const channelId = searchParams.get("channelId");

    if (!wid || !channelId) {
      return NextResponse.json(
        { error: "Missing wid or channelId" },
        { status: 400 }
      );
    }

    // Fetch channel
    const channel = await channelService.getChannel(wid, channelId);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Safety check: ensure it's email channel
    if (channel.provider !== "email") {
      return NextResponse.json(
        { error: "Not an email channel" },
        { status: 400 }
      );
    }

    // Delete sender signature from Postmark
    const signatureId = channel.credentials?.signatureId;
    if (signatureId) {
      try {
        await postmarkService.deleteSenderSignature(signatureId);
      } catch (error) {
        console.error(
          "Failed to delete sender signature form postmark:",
          error
        );
      }
    }

    await channelService.deleteChannel(wid, channelId);

    return NextResponse.json(
      { message: "Email channel disconnected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disconnecting email channel:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
