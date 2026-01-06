import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import { waconf } from "@/lib/utils/conf";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import { errorResponse, successResponse } from "@/lib/types/api-response";
import waService from "@/lib/services/whatsapp/wa-service";

const whatsappAuthSchema = z.object({
  wid: z.string().min(1, "Workspace ID is required"),
  phone_number_id: z.string().min(1, "Phone number ID is required"),
  waba_id: z.string().min(1, "WABA ID is required"),
  business_id: z.string().min(1, "Business ID is required"),
  authorizationCode: z.string().min(1, "Authorization code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedParams = whatsappAuthSchema.parse(body);

    if (!validatedParams.wid) {
      return errorResponse("Workspace ID is required", 400);
    }

    if (!validatedParams.phone_number_id) {
      return errorResponse("phoneId is required", 400);
    }

    const { access_token, token_type, expires_in } =
      await waService.getAccessToken({
        authorizationCode: validatedParams.authorizationCode,
      });

    if (!access_token) {
      return errorResponse("Failed to retrieve access token", 400);
    }

    const credentials: Record<string, string> = {
      access_token,
    };

    if (token_type) {
      credentials.token_type = token_type;
    }

    if (expires_in !== undefined && expires_in !== null) {
      credentials.expires_in = String(expires_in);
    }

    const phoneInfo = await waService.getNumberInfo({
      phoneId: validatedParams.phone_number_id,
      accessToken: access_token,
    });
    if (!phoneInfo) {
      return errorResponse("Failed to retrieve phone number info", 400);
    }

    await waService.subscribeToWebhook({
      wabaId: validatedParams.waba_id,
      accessToken: access_token,
    });

    const metadata = {
      phone_number_id: validatedParams.phone_number_id,
      name: phoneInfo.name,
      phone_number: phoneInfo.display_phone_number,
      waba_id: validatedParams.waba_id,
      business_id: validatedParams.business_id,
      connection_status: phoneInfo.status,
    };

    const channel = generateDefaultChannel(
      validatedParams.phone_number_id,
      "whatsapp",
      credentials,
      metadata
    );

    await channelService.addChannel(validatedParams.wid, channel);

    return successResponse(
      {
        channelId: channel.id,
        phoneNumber: phoneInfo.display_phone_number,
        name: phoneInfo.name,
      },
      "WhatsApp channel connected successfully"
    );
  } catch (error: any) {
    console.error("Error during WhatsApp OAuth:", error);
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.issues
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`,
        400
      );
    }
    return errorResponse(
      error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to connect WhatsApp channel",
      error?.response?.status || 500
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wid = searchParams.get("wid");
    const channelId = searchParams.get("channelId");

    if (!wid || !channelId) {
      return errorResponse("Missing wid or channelId parameters", 400);
    }

    const channel = await channelService.getChannel(wid, channelId);
    if (!channel) {
      return errorResponse("Channel not found", 404);
    }

    const accessToken = channel.credentials.access_token as string;
    const wabaId = channel.metadata.waba_id as string;

    if (!accessToken || !wabaId) {
      return errorResponse("No access token or WABA ID found for channel", 400);
    }

    await waService.unsubscribeFromWebhook({
      wabaId,
      accessToken,
    });

    await channelService.deleteChannel(wid, channelId);
    return successResponse(null, "Successfully disconnected WhatsApp channel");
  } catch (error: any) {
    console.error("Error during WhatsApp channel disconnect:", error);
    return errorResponse(
      error?.message || "Failed to disconnect WhatsApp channel",
      error?.response?.status || 500
    );
  }
}
