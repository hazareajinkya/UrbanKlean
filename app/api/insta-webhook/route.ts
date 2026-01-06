import { NextResponse } from "next/server";
import waParser from "@/lib/services/whatsapp/wa-webhook-parser";
import { IWAContact } from "@/lib/types/wa-api";
import { IWAMessage } from "@/lib/types/wa-api";
import waService from "@/lib/services/whatsapp/wa-service";
import waBotService from "@/lib/services/whatsapp/wa-bot-service";
import instaParser from "@/lib/services/instagram/insta-webhook-parser";
import instaService from "@/lib/services/instagram/insta-service";
import { INSTA_ID } from "@/lib/utils/conf";
import instaBotService from "@/lib/services/instagram/insta-bot-service";
import channelService from "@/lib/services/channel-service";

// Function to send a text message
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("POST request received");

    const body = await req.json();
    const msg = instaParser.parseTextMessage(body);

    if (msg.from === INSTA_ID) {
      return NextResponse.json(
        { message: "Webhook received and processed successfully" },
        { status: 200 }
      );
    }

    const channel = await channelService.getChannelByPageId(
      msg.to,
      "instagram"
    );
    if (!channel) {
      console.error("No channel found on instagram webhook");
      return NextResponse.json(
        { message: "No channel found" },
        { status: 200 }
      );
    }

    const { success, message: ans } = await instaBotService.generateResponse({
      instaMsg: msg,
      instaUserId: msg.from,
      channel: "instagram",
      agentId: channel.assignedAgentId,
      accessToken: channel.credentials.access_token,
    });

    if (success) {
      await instaService.sendTextMessage({
        to: msg.from,
        text: ans ?? "placeholder",
        instaUserId: channel.metadata.id,
        accessToken: channel.credentials.access_token,
      });
    }

    //Is WA Message
    // if (value.messages) {
    //   const msgType = body.entry[0].changes[0].value.messages[0].type;

    //   let parsed: {
    //     contact: IWAContact;
    //     msg: IWAMessage;
    //   } | null = null;

    //   if (msgType === "text") {
    //     parsed = waParser.parseTextMessage(body);
    //   } else if (msgType === "image") {
    //     parsed = await waParser.parseImageMessage(body);
    //   }

    //   if (!parsed) return;

    //   const query =
    //     msgType === "image" ? parsed.msg.image?.url : parsed.msg.text;

    //   console.log("user query: ", query);
    //   await waService.sendTypingIndicator(parsed.msg.id);

    //   const ans = await waBotService.generateResponse(
    //     parsed.msg,
    //     parsed.contact.waId
    //   );

    //   await waService.sendWATextMessage(
    //     parsed.contact.waId,
    //     ans ?? "placeholder"
    //   );
    // }
    // //Status update
    // else if (value.statuses) {
    //   const status = value.statuses[0].status;
    //   const msgId = value.statuses[0].id;
    //   const phone = value.statuses[0].recipient_id;

    //   const hasMsgRead = status === "read";
    //   console.log("message status:", status);

    //   if (value.statuses[0].errors) {
    //     console.error("WhatsApp status error: ", value.statuses[0].errors);
    //   }
    // }

    return NextResponse.json(
      { message: "Webhook received and message resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Instagram webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 200 }
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
