import { NextResponse } from "next/server";
import postmarkParser from "@/lib/services/postmark/postmark-webhook-parser";
import { IPostmarkInboundWebhook } from "@/lib/types/postmark-api";
import postmarkBotService from "@/lib/services/postmark/postmark-bot-service";
import postmarkService from "@/lib/services/postmark/postmark-service";
import { AxiosError } from "axios";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("Postmark webhook received");
    const body = (await req.json()) as IPostmarkInboundWebhook;

    // Check if it's spam
    if (postmarkParser.isSpam(body)) {
      console.log("Email marked as spam, ignoring");
      return NextResponse.json(
        { message: "Spam email ignored" },
        { status: 200 }
      );
    }

    // Check if it's an auto-reply
    if (postmarkParser.isAutoReply(body)) {
      console.log("Auto-reply detected, ignoring");
      return NextResponse.json(
        { message: "Auto-reply ignored" },
        { status: 200 }
      );
    }

    // Parse the inbound email
    const parsedMessage = postmarkParser.parseInboundEmail(body);

    // console.log("Parsed message:", {
    //   id: parsedMessage.id,
    //   from: parsedMessage.from,
    //   subject: parsedMessage.subject,
    //   to: parsedMessage.to,
    //   textBody: parsedMessage.textBody,
    //   type: parsedMessage.type,
    //   references: parsedMessage.references,
    //   inReplyTo: parsedMessage.inReplyTo,
    //   replyTo: parsedMessage.replyTo,
    //   hasAttachments: postmarkParser.hasAttachments(body),
    //   attachmentCount: postmarkParser.getAttachmentCount(body),
    // });

    // Check if the email needs to be replied or not by checking

    // Step 2: Generate AI response using your bot service
    const { success, message: ans } = await postmarkBotService.generateResponse(
      parsedMessage,
      parsedMessage.to,
      parsedMessage.from,
      "email"
    );

    // // Step 3: Send reply via Postmark
    if (success && ans) {
      // Ensure subject has "Re:" prefix but avoid duplicates
      const subject = parsedMessage.subject.startsWith("Re:")
        ? parsedMessage.subject
        : `Re: ${parsedMessage.subject}`;

      // Build References header to maintain thread chain
      const references = parsedMessage.references
        ? `${parsedMessage.references} ${parsedMessage.id}`
        : parsedMessage.id;

      await postmarkService.sendReply({
        to: parsedMessage.from,
        // Change this get approval
        from: parsedMessage.to,
        // from: parsedMessage.from,
        subject: subject,
        textBody: ans,
        inReplyTo: parsedMessage.inReplyTo,
        references: references,
        tag: "ai-response",
      });
    }

    return NextResponse.json(
      { message: "Webhook received and processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Postmark webhook:", error);
    if (error instanceof AxiosError) {
      console.log("axios_error: ", error.response?.data);
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 200 }
    );
  }
}
