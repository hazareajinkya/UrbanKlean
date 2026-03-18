import { NextResponse } from "next/server";
import instaParser from "@/lib/services/instagram/insta-webhook-parser";
import instaService from "@/lib/services/instagram/insta-service";
import { INSTA_ID } from "@/lib/utils/conf";
import instaBotService from "@/lib/services/instagram/insta-bot-service";
import channelService from "@/lib/services/channel-service";
import { AxiosError } from "axios";

// Function to send a text message
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("POST request received");

    const body = await req.json();
    const msg = instaParser.parseMessage(body);

    // Null = echo, deleted, unsupported, ephemeral — always 200 to Meta
    if (!msg || msg.from === INSTA_ID) {
      return NextResponse.json(
        { message: "Webhook received and processed successfully" },
        { status: 200 },
      );
    }

    const channel = await channelService.getChannelByPageId(
      msg.to,
      "instagram",
    );
    if (!channel) {
      console.error("No channel found on instagram webhook");
      return NextResponse.json(
        { message: "No channel found" },
        { status: 200 },
      );
    }

    const accessToken = channel.credentials.access_token;
    instaService
      .sendSenderAction({
        to: msg.from,
        accessToken,
        action: "typing_on",
      })
      .catch((error) =>
        console.warn("Failed to send instagram typing_on:", error),
      );

    try {
      const {
        success,
        message: ans,
        messages,
      } = await instaBotService.generateResponse({
        instaMsg: msg,
        instaUserId: msg.from,
        channel: "instagram",
        agentId: channel.assignedAgentId,
        accessToken,
      });

      if (success) {
        const chunks = messages?.length ? messages : [ans ?? "placeholder"];
        for (const text of chunks) {
          await instaService.sendTextMessage({
            to: msg.from,
            text,
            instaUserId: channel.metadata.id,
            accessToken,
          });
        }
      } else if (msg.type === "image") {
        // Model doesn't support vision or failed to process the image
        await instaService.sendTextMessage({
          to: msg.from,
          text: "Sorry, I'm unable to process images at the moment.",
          instaUserId: channel.metadata.id,
          accessToken,
        });
      }
    } finally {
      instaService
        .sendSenderAction({
          to: msg.from,
          accessToken,
          action: "typing_off",
        })
        .catch((error) =>
          console.warn("Failed to send instagram typing_off:", error),
        );
    }

    return NextResponse.json(
      { message: "Webhook received and message resent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing Instagram webhook:", error);
    if (error instanceof AxiosError) {
      console.error("Axios error:", error.response?.data);
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 200 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  console.log(mode, token, challenge);

  if (mode === "subscribe" && token === process.env.INSTA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
