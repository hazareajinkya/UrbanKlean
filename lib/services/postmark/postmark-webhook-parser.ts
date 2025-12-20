import {
  IPostmarkInboundWebhook,
  IPostmarkMessage,
} from "@/lib/types/postmark-api";
import { htmlToText } from "html-to-text";

class PostmarkWebhookParser {
  parseInboundEmail(body: IPostmarkInboundWebhook): IPostmarkMessage {
    const msg: IPostmarkMessage = {
      id: body.MessageID,
      from: body.FromFull.Email,
      fromName: body.FromFull.Name || body.FromName,
      to: body.ToFull[0]?.Email || body.To,
      subject: body.Subject,
      textBody:
        body.TextBody ||
        htmlToText(body.HtmlBody || "", {
          wordwrap: false,
          selectors: [{ selector: "img", format: "skip" }],
        }),
      htmlBody: body.HtmlBody,
      strippedTextReply: body.StrippedTextReply,
      timestamp: body.Date,
      type: "email",
      replyTo: body.ReplyTo,
      cc: body.CcFull?.map((cc) => cc.Email),
      attachments: body.Attachments,
      mailboxHash: body.MailboxHash,
      messageStream: body.MessageStream,
      inReplyTo: this.getInReplyTo(body),
      references: this.getReferences(body),
    };

    return msg;
  }

  getInReplyTo(body: IPostmarkInboundWebhook): string | undefined {
    const header = body.Headers.find((h) => h.Name === "In-Reply-To");
    return header?.Value;
  }

  getReferences(body: IPostmarkInboundWebhook): string | undefined {
    const header = body.Headers.find((h) => h.Name === "References");
    return header?.Value;
  }

  extractRecipientEmail(toAddress: string): string {
    // Extract the email address from the To field
    // Example: "451d9b70cf9364d23ff6f9d51d870251569e+ahoy@inbound.postmarkapp.com"
    return toAddress.split("@")[0].split("+")[0];
  }

  extractMailboxHash(body: IPostmarkInboundWebhook): string {
    // Returns the mailbox hash which can be used for routing
    return body.MailboxHash;
  }

  hasAttachments(body: IPostmarkInboundWebhook): boolean {
    return body.Attachments ? body.Attachments.length > 0 : false;
  }

  getAttachmentCount(body: IPostmarkInboundWebhook): number {
    return body.Attachments?.length || 0;
  }

  isAutoReply(body: IPostmarkInboundWebhook): boolean {
    // Check common auto-reply indicators in headers
    const headers = body.Headers;
    const autoReplyHeaders = [
      "X-Autorespond",
      "X-Auto-Response-Suppress",
      "Auto-Submitted",
    ];

    return headers.some((header) => autoReplyHeaders.includes(header.Name));
  }

  getSpamScore(body: IPostmarkInboundWebhook): number | null {
    // Extract spam score from headers if available
    const spamScoreHeader = body.Headers.find((h) => h.Name === "X-Spam-Score");
    return spamScoreHeader ? parseFloat(spamScoreHeader.Value) : null;
  }

  isSpam(body: IPostmarkInboundWebhook): boolean {
    const spamStatusHeader = body.Headers.find(
      (h) => h.Name === "X-Spam-Status"
    );
    return spamStatusHeader?.Value.toLowerCase().includes("yes") || false;
  }
}

const postmarkParser = new PostmarkWebhookParser();
export default postmarkParser;
