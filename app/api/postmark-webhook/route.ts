import { NextResponse } from "next/server";
import postmarkParser from "@/lib/services/postmark/postmark-webhook-parser";
import { IPostmarkInboundWebhook } from "@/lib/types/postmark-api";
import postmarkBotService from "@/lib/services/postmark/postmark-bot-service";
import postmarkService from "@/lib/services/postmark/postmark-service";
import channelService from "@/lib/services/channel-service";
import { AxiosError } from "axios";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("Postmark webhook received");
    const body = (await req.json()) as IPostmarkInboundWebhook;

    const hardSkipReason = postmarkParser.getHardSkipReason(body);
    if (hardSkipReason) {
      console.log(
        `Skipping Postmark reply due to hard rule: ${hardSkipReason}`,
      );
      return NextResponse.json(
        { message: "No reply needed", reason: hardSkipReason },
        { status: 200 },
      );
    }

    // Parse the inbound email
    const parsedMessage = postmarkParser.parseInboundEmail(body);

    const shouldReplyDecision =
      await postmarkBotService.shouldReplyToEmail(parsedMessage);
    if (!shouldReplyDecision.shouldReply) {
      console.log("Skipping Postmark reply due to AI decision", {
        reason: shouldReplyDecision.reason,
        confidence: shouldReplyDecision.confidence,
      });
      return NextResponse.json(
        {
          message: "No reply needed",
          reason: shouldReplyDecision.reason,
          confidence: shouldReplyDecision.confidence,
        },
        { status: 200 },
      );
    }

    // Get the email channel to check type
    const channel = await channelService.getChannelByPageId(
      parsedMessage.to,
      "email",
    );

    // Determine channel type (default to "default" if not set)
    const channelType =
      (channel?.metadata?.type as "white-labeled" | "default") || "default";

    // Step 2: Generate AI response using your bot service
    const { success, message: ans } = await postmarkBotService.generateResponse(
      parsedMessage,
      parsedMessage.to,
      parsedMessage.from,
      "email",
    );

    // Step 3: Send reply via Postmark
    if (success && ans) {
      // Ensure subject has "Re:" prefix but avoid duplicates
      const subject = parsedMessage.subject.startsWith("Re:")
        ? parsedMessage.subject
        : `Re: ${parsedMessage.subject}`;

      // Build References header to maintain thread chain
      const references = parsedMessage.references
        ? `${parsedMessage.references} ${parsedMessage.id}`
        : parsedMessage.id;

      const ccAddresses: string[] = [];
      if (parsedMessage.to) {
        ccAddresses.push(parsedMessage.to);
      }
      if (parsedMessage.cc && parsedMessage.cc.length > 0) {
        ccAddresses.push(...parsedMessage.cc);
      }
      const uniqueCc = [...new Set(ccAddresses)].filter(
        (email) => email !== parsedMessage.from,
      );

      const from =
        channelType === "white-labeled"
          ? parsedMessage.to
          : `${channel?.metadata.name} <noreply@magicalcx-mail.com>`;

      await postmarkService.sendReply({
        to: parsedMessage.from,
        from,
        subject: subject,
        textBody: ans,
        replyTo: parsedMessage.to,
        inReplyTo: parsedMessage.inReplyTo,
        references: references,
        tag: "ai-response",
        cc: uniqueCc.length > 0 ? uniqueCc.join(", ") : undefined,
      });
    }

    return NextResponse.json(
      { message: "Webhook received and processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing Postmark webhook:", error);
    if (error instanceof AxiosError) {
      console.log("axios_error: ", error.response?.data);
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 200 },
    );
  }
}
