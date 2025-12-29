import { NextResponse } from "next/server";
import waParser from "@/lib/services/whatsapp/wa-webhook-parser";
import { IWAContact } from "@/lib/types/wa-api";
import { IWAMessage } from "@/lib/types/wa-api";
import waService from "@/lib/services/whatsapp/wa-service";
import waBotService from "@/lib/services/whatsapp/wa-bot-service";
import channelService from "@/lib/services/channel-service";

// Function to send a text message
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("POST request received");
    const body = await req.json();

    const value = body.entry[0].changes[0].value;

    const phoneNumberId = value.metadata?.phone_number_id || body.entry[0].id;

    if (!phoneNumberId) {
      console.error("phone_number_id not found in webhook");
      return NextResponse.json(
        { error: "phone_number_id not found" },
        { status: 400 }
      );
    }
    const channel = await channelService.getChannelByPhoneNumberId(
      phoneNumberId
    );

    if (!channel) {
      console.log(
        `Unable to find channel for phone_number_id ${phoneNumberId}`
      );
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 200 }
      );
    }

    const phoneId = channel.metadata.phone_number_id;
    const agentId = channel.assignedAgentId;

    if (!agentId) {
      console.log(
        `No agent assigned to channel for phone_number_id ${phoneNumberId}`
      );
      return NextResponse.json(
        { message: "No agent assigned to channel" },
        { status: 200 }
      );
    }

    //Is WA Message
    if (value.messages) {
      const msgType = body.entry[0].changes[0].value.messages[0].type;

      let parsed: {
        contact: IWAContact;
        msg: IWAMessage;
      } | null = null;

      if (msgType === "text") {
        parsed = waParser.parseTextMessage(body);
      } else if (msgType === "image") {
        parsed = await waParser.parseImageMessage(body, phoneId);
      }

      if (!parsed) return;

      const query =
        msgType === "image" ? parsed.msg.image?.url : parsed.msg.text;

      console.log("user query: ", query);

      console.log("Whatsapp body: ", parsed);

      await waService.sendTypingIndicator({
        messageId: parsed.msg.id,
        phoneId,
        accessToken: channel.credentials.access_token,
      });

      const { success, message: ans } = await waBotService.generateResponse({
        waMsg: parsed.msg,
        userId: parsed.contact.waId,
        waPhoneId: parsed.contact.waId,
        name: parsed.contact.name,
        channel: "whatsapp",
        agentId,
      });

      if (success) {
        try {
          await waService.sendWATextMessage({
            to: parsed.contact.waId,
            text: ans ?? "placeholder",
            phoneId,
            accessToken: channel.credentials.access_token,
          });
        } catch (error: any) {
          if (
            error.message?.includes(
              "Recipient phone number not in allowed list"
            )
          ) {
            console.warn(
              `Cannot send message to ${parsed.contact.waId}: ${error.message}. ` +
                `This is expected in development/test mode. Add the number to the allowed recipient list in Meta Business Manager.`
            );
          } else {
            throw error;
          }
        }
      }
    }
    //Status update
    else if (value.statuses) {
      const status = value.statuses[0].status;
      const msgId = value.statuses[0].id;
      const phone = value.statuses[0].recipient_id;

      const hasMsgRead = status === "read";
      console.log("message status:", status);

      if (value.statuses[0].errors) {
        console.error("WhatsApp status error: ", value.statuses[0].errors);
      }
    }

    return NextResponse.json(
      { message: "Webhook received and message resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  console.log(mode, token, challenge);

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
