import { postmarkClient } from "@/lib/clients/axios-client";

interface ISendEmailParams {
  from: string;
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
  tag?: string;
  trackOpens?: boolean;
  trackLinks?: "None" | "HtmlAndText" | "HtmlOnly" | "TextOnly";
  messageStream?: string;
}

interface IEmailResponse {
  To: string;
  SubmittedAt: string;
  MessageID: string;
  ErrorCode: number;
  Message: string;
}

class PostmarkService {
  async sendEmail(params: ISendEmailParams): Promise<IEmailResponse> {
    try {
      const payload = {
        From: params.from,
        To: params.to,
        Subject: params.subject,
        TextBody: params.textBody,
        HtmlBody: params.htmlBody,
        ReplyTo: params.replyTo,
        Cc: params.cc,
        Bcc: params.bcc,
        Tag: params.tag,
        TrackOpens: params.trackOpens ?? false,
        TrackLinks: params.trackLinks ?? "None",
        MessageStream: params.messageStream ?? "outbound",
      };

      const response = await postmarkClient.post("/email", payload);

      console.log(
        `Email sent to ${params.to} with ID: ${response.data.MessageID}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending email:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async sendReply(params: {
    to: string;
    from: string;
    subject: string;
    textBody?: string;
    htmlBody?: string;
    inReplyTo?: string;
    references?: string;
    tag?: string;
  }): Promise<IEmailResponse> {
    try {
      const payload = {
        From: params.from,
        To: params.to,
        Subject: params.subject,
        TextBody: params.textBody,
        // HtmlBody: params.htmlBody,
        Tag: params.tag,
        Headers: [
          ...(params.inReplyTo
            ? [{ Name: "In-Reply-To", Value: params.inReplyTo }]
            : []),
          ...(params.references
            ? [{ Name: "References", Value: params.references }]
            : []),
        ],
        MessageStream: "outbound",
      };

      const response = await postmarkClient.post("/email", payload);

      console.log(
        `Reply sent to ${params.to} with ID: ${response.data.MessageID}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending reply:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getServerInfo(): Promise<any> {
    try {
      const response = await postmarkClient.get("/server");
      return response.data;
    } catch (error: any) {
      console.error(
        "Error getting server info:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getMessageDetails(messageId: string): Promise<any> {
    try {
      const response = await postmarkClient.get(
        `/messages/outbound/${messageId}/details`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error getting message details:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getInboundMessageDetails(messageId: string): Promise<any> {
    try {
      const response = await postmarkClient.get(
        `/messages/inbound/${messageId}/details`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Error getting inbound message details:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

const postmarkService = new PostmarkService();
export default postmarkService;
