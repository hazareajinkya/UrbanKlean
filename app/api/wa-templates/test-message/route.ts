import { NextRequest } from "next/server";
import channelService from "@/lib/services/channel-service";
import waService from "@/lib/services/whatsapp/wa-service";
import {
  errorResponse,
  successResponse,
  validateBody,
} from "@/lib/types/api-response";
import { z } from "zod";

const zTestMessage = z.object({
  wid: z.string().min(1, "wid is required"),
  to: z.string().min(1, "to is required"),
  templateName: z.string().min(1, "templateName is required"),
  languageCode: z.string().min(1, "languageCode is required"),
  components: z.array(z.any()).optional(),
});
export async function POST(req: NextRequest) {
  try {
    const { wid, to, templateName, languageCode, components } =
      await validateBody(req, zTestMessage);

    const channels = await channelService.getChannels(wid);
    const waChannel = channels.find((c) => c.provider === "whatsapp");
    if (!waChannel)
      return errorResponse("No WhatsApp channel found for this workspace", 404);

    const phoneId = waChannel.metadata.phone_number_id;
    const accessToken = waChannel.credentials.access_token;
    if (!phoneId || !accessToken)
      return errorResponse("WhatsApp channel credentials incomplete", 400);

    try {
      const verifyRes = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}?fields=display_phone_number,verified_name,quality_rating`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const verifyData = await verifyRes.json();
      console.log("Verified Name Check:", verifyData);
    } catch (err) {
      console.error("Failed to check verified_name:", err);
    }

    console.log({
      to,
      phoneId,
      accessToken,
      templateName,
      languageCode,
      components,
    });
    const messageId = await waService.sendTemplateTestMessage({
      to,
      phoneId,
      accessToken,
      templateName,
      languageCode,
      components,
    });

    return successResponse(
      { messageId },
      "Test template message sent successfully",
    );
  } catch (error: any) {
    console.error(
      "Error sending template test message:",
      error?.response?.data || error,
    );

    const metaError = error?.response?.data?.error;
    const metaMessage = metaError?.message || error?.message;
    const metaCode = metaError?.code;

    if (metaCode === 131037) {
      return errorResponse(
        "Your WhatsApp number needs display name approval from Meta before it can send messages. Please check your WhatsApp Manager.",
        400,
      );
    }

    if (
      metaCode === 131030 ||
      (metaMessage &&
        metaMessage.includes("Recipient phone number not in allowed list"))
    ) {
      return errorResponse(
        `WhatsApp API restriction: ${metaMessage}. Please add the recipient phone number to the allowed list in Meta Business Manager.`,
        400,
      );
    }

    const statusCode = error?.response?.status || 500;
    return errorResponse(
      metaMessage || "Failed to send test message",
      statusCode >= 400 && statusCode < 500 ? statusCode : 500,
    );
  }
}
