import { NextResponse } from "next/server";
import waParser from "@/lib/services/whatsapp/wa-webhook-parser";
import { IWAContact } from "@/lib/types/wa-api";
import { IWAMessage } from "@/lib/types/wa-api";
import waService from "@/lib/services/whatsapp/wa-service";
import waBotService from "@/lib/services/whatsapp/wa-bot-service";
import instaParser from "@/lib/services/instagram/insta-webhook-parser";
import instaService from "@/lib/services/instagram/insta-service";
import { INSTA_ID } from "@/lib/utils/conf";
import messengerParser from "@/lib/services/messenger/messenger-webhook-parser";
import messengerService from "@/lib/services/messenger/messenger-service";
import channelService from "@/lib/services/channel-service";
import { successResponse } from "@/lib/types/api-response";
import messengerBotService from "@/lib/services/messenger/messenger-bot-service";

// Function to send a text message
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("POST request received");
    const body = await req.json();

    const msg = messengerParser.parseTextMessage(body);

    // Get channel by Page ID to get access token
    const channel = await channelService.getChannelByPageId(
      msg.to,
      "messenger"
    );

    if (!channel) {
      console.log(
        `Unable to find channel for Page ID ${msg.to} with provider messenger`
      );
      return successResponse(200, "Processed message but no channel found");
    }

    // Filter out echo messages (messages sent by the page itself)
    const pageId = channel.metadata.id as string;
    if (msg.from === pageId) {
      return NextResponse.json(
        {
          message: "Webhook received and processed successfully (echo message)",
        },
        { status: 200 }
      );
    }

    const agentId = channel.assignedAgentId;

    if (!agentId) {
      console.log(
        `Unable to resolve agent for ${msg.to} with provider messenger`
      );
      return successResponse(200, "Processed message ");
    }

    const { success, message: ans } =
      await messengerBotService.generateResponse({
        msg,
        messengerUserId: msg.from,
        channel: "messenger",
        agentId,
      });
    if (success) {
      const pageId = channel.metadata.id as string;
      // Use page_access_token if available, fallback to access_token
      const pageAccessToken =
        (channel.credentials.page_access_token as string) ||
        (channel.credentials.access_token as string);

      if (!pageId || !pageAccessToken) {
        console.error("Missing pageId or pageAccessToken in channel", {
          pageId,
          hasPageAccessToken: !!pageAccessToken,
        });
        return successResponse(200, "Processed message ");
      }

      await messengerService.sendTextMessage({
        to: msg.from,
        text: ans ?? "placeholder",
        pageId,
        accessToken: pageAccessToken,
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
    console.error("Error processing facebook webhook:", error);
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

  if (mode === "subscribe" && token === process.env.FB_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
