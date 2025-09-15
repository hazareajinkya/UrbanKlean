import { NextResponse } from "next/server";
import waParser from "@/lib/services/whatsapp/wa-webhook-parser";
import { IWAContact } from "@/lib/types/wa-api";
import { IWAMessage } from "@/lib/types/wa-api";
import waBotService from "@/lib/services/whatsapp/wa-service";

// Function to send a text message
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("POST request received");
    const body = await req.json();

    console.log(body);

    console.log(body.entry[0]);
    console.log(body.entry[0].changes[0]);
    console.log(body.entry[0].changes[0].value);

    const value = body.entry[0].changes[0].value;

    //Is WA Message
    if (value.messages) {
      console.log(body.entry[0].changes[0].value.messages[0]);
      const msgType = body.entry[0].changes[0].value.messages[0].type;

      let parsed: {
        contact: IWAContact;
        msg: IWAMessage;
      } | null = null;

      if (msgType === "text") {
        parsed = waParser.parseTextMessage(body);
      } else if (msgType === "image") {
        parsed = await waParser.parseImageMessage(body);
      }

      if (!parsed) return;

      const query =
        msgType === "image" ? parsed.msg.image?.url : parsed.msg.text;

      await waBotService.sendWATextMessage(
        parsed.contact.waId,
        query ?? "Hi, testing this thing"
      );

      //   await waBotService.generateResponse(
      //     parsed.contact.waId,
      //     query ?? "",
      //     msgType
      //   );
    }
    //Status update
    else if (value.statuses) {
      const status = value.statuses[0].status;
      const msgId = value.statuses[0].id;
      const phone = value.statuses[0].recipient_id;

      const hasMsgRead = status === "read";
      console.log("message status: ", status);
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

  if (mode === "subscribe" && token === "dawa") {
    console.log(req);
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
