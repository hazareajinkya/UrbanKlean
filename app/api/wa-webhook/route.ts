import { NextResponse } from "next/server";
import waParser from "@/lib/services/whatsapp/wa-webhook-parser";
import { IWAContact } from "@/lib/types/wa-api";
import { IWAMessage } from "@/lib/types/wa-api";
import waService from "@/lib/services/whatsapp/wa-service";
import waBotService from "@/lib/services/whatsapp/wa-bot-service";
import channelService from "@/lib/services/channel-service";
import axios from "axios";
// Function to send a text message
export const maxDuration = 60;

const logWebhook = (message: string, data?: unknown) => {
  if (data === undefined) return console.log(`[wa-webhook] ${message}`);
  console.log(`[wa-webhook] ${message}`, data);
};

const logWebhookError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(`[wa-webhook] ${context} - axios error`, {
      message: error.message,
      code: error.code,
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status,
      response: error.response?.data,
    });
    return;
  }
  if (error instanceof Error) {
    console.error(`[wa-webhook] ${context} - error`, {
      message: error.message,
      stack: error.stack,
    });
    return;
  }
  console.error(`[wa-webhook] ${context} - unknown`, error);
};

export async function POST(req: Request) {
  try {
    logWebhook("POST request received");
    const body = await req.json();

    const value = body.entry[0].changes[0].value;

    const phoneNumberId = value.metadata?.phone_number_id || body.entry[0].id;

    if (!phoneNumberId) {
      logWebhook("phone_number_id not found in webhook");
      return NextResponse.json(
        { error: "phone_number_id not found" },
        { status: 400 },
      );
    }
    const channel =
      await channelService.getChannelByPhoneNumberId(phoneNumberId);

    if (!channel) {
      logWebhook(`Unable to find channel for phone_number_id ${phoneNumberId}`);
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 200 },
      );
    }

    const phoneId = channel.metadata.phone_number_id;
    const agentId = channel.assignedAgentId;

    if (!agentId) {
      logWebhook(`No agent assigned to channel for phone_number_id ${phoneNumberId}`);
      return NextResponse.json(
        { message: "No agent assigned to channel" },
        { status: 200 },
      );
    }

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

      logWebhook("incoming user query", { msgType, query, phoneNumberId });
      logWebhook("parsed whatsapp payload", parsed);

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
              "Recipient phone number not in allowed list",
            )
          ) {
            console.warn(
              `[wa-webhook] Cannot send message to ${parsed.contact.waId}: ${error.message}. ` +
                `This is expected in development/test mode. Add the number to the allowed recipient list in Meta Business Manager.`,
            );
          } else {
            logWebhookError(error, "failed to send whatsapp text response");
            throw error;
          }
        }
      }
    }
    else if (value.statuses) {
      const status = value.statuses[0].status;
      const msgId = value.statuses[0].id;
      const phone = value.statuses[0].recipient_id;

      const hasMsgRead = status === "read";
      logWebhook("message status update", { status, msgId, phone, hasMsgRead });

      if (value.statuses[0].errors) {
        logWebhook("whatsapp status contains errors");
        logWebhookError(value.statuses[0].errors, "status errors from whatsapp");
      }
    }
    else if (
      body.entry[0].changes[0].field === "message_template_status_update"
    ) {
      const change = body.entry[0].changes[0].value;
      const {
        event,
        message_template_id,
        message_template_name,
        message_template_language,
        reason,
      } = change;

      logWebhook(
        `Template status update: ${message_template_name} -> ${event}`,
      );

      const wabaId = body.entry[0].id;
      const channelInfo = await channelService.getChannelByWabaId(wabaId);

      if (channelInfo && channelInfo.wid) {
        const statusMap: Record<string, string> = {
          APPROVED: "APPROVED",
          REJECTED: "REJECTED",
          PENDING_DELETION: "PENDING_DELETION",
        };

        const newStatus = statusMap[event] || event;

        await waService.updateTemplateStatus({
          wid: channelInfo.wid,
          templateId: message_template_id,
          status: newStatus,
          rejectedReason: reason,
        });
        logWebhook(
          `Updated template ${message_template_name} status to ${newStatus} for workspace ${channelInfo.wid}`,
        );
      } else {
        logWebhook(
          `Could not find workspace for WABA ID ${wabaId} to update template status`,
        );
      }
    }

    return NextResponse.json(
      { message: "Webhook received and message resent successfully" },
      { status: 200 },
    );
  } catch (error) {
    logWebhookError(error, "error processing whatsapp webhook");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  logWebhook("webhook verification request", { mode, token, challenge });

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Verification failed", { status: 403 });
  }
}
