import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import { FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI } from "@/lib/constants";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import messengerService from "@/lib/services/messenger/messenger-service";
import { getProtocol } from "@/lib/utils";

const facebookAuthSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
  state: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  console.log("Facebook OAuth queryParams: ", queryParams);

  const wid = searchParams.get("state");

  const finishedUrl = `/workspaces/${wid}/channels`;

  const errorUrl = new URL(
    `${finishedUrl}?error=Missing authorization code`,
    req.nextUrl.origin
  );
  const successUrl = new URL(
    `${finishedUrl}?facebook=success`,
    req.nextUrl.origin
  );
  successUrl.protocol = getProtocol(req);
  errorUrl.protocol = getProtocol(req);

  if (!wid) {
    throw new Error("Workspace ID is required");
  }

  try {
    const validatedParams = facebookAuthSchema.parse(queryParams);

    if (validatedParams.error) {
      console.error(
        `Facebook OAuth Error: ${validatedParams.error_reason} - ${validatedParams.error_description}`
      );
      return NextResponse.redirect(errorUrl);
    }

    if (!validatedParams.code) {
      return NextResponse.redirect(errorUrl);
    }

    // Step 2: Exchange the Code for an Access Token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          client_id: FB_APP_ID,
          redirect_uri: FB_REDIRECT_URI,
          client_secret: FB_APP_SECRET,
          code: validatedParams.code,
        },
      }
    );

    const { access_token, token_type, expires_in } = tokenResponse.data;

    console.log("Facebook token data:", tokenResponse.data);

    if (!access_token) {
      throw new Error("Failed to retrieve access token.");
    }

    // Step 3: Inspect the Access Token (Optional but recommended for security)
    const appAccessToken = `${FB_APP_ID}|${FB_APP_SECRET}`;
    const debugResponse = await axios.get(
      "https://graph.facebook.com/debug_token",
      {
        params: {
          input_token: access_token,
          access_token: appAccessToken,
        },
      }
    );

    console.log("Token debug data:", debugResponse.data);

    const { data: tokenData } = debugResponse.data;

    if (!tokenData.is_valid) {
      throw new Error("Invalid access token received");
    }

    if (tokenData.app_id !== FB_APP_ID) {
      throw new Error("Access token does not belong to this app");
    }

    const user_id = tokenData.user_id;

    // Step 4: Get user profile data
    const data = await messengerService.getProfile(access_token);

    console.log("Facebook profile data:", data);

    const credentials = {
      access_token,
      token_type,
      expires_in,
    };

    const metadata = { ...data };

    // Step 5: Subscribe to webhook (if needed)
    try {
      await messengerService.subscribeToWebhook(access_token);
    } catch (error) {
      console.warn("Warning: Could not subscribe to webhook:", error);
      // Continue even if webhook subscription fails
    }

    // Step 6: Create and save channel
    const channel = generateDefaultChannel(
      user_id,
      "messenger",
      credentials,
      metadata
    );

    await channelService.addChannel(wid, channel);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Error during Facebook OAuth:", error);

    return NextResponse.redirect(errorUrl);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wid = searchParams.get("wid");
    const channelId = searchParams.get("channelId");

    if (!wid || !channelId) {
      return NextResponse.json(
        { error: "Missing wid or channelId parameters" },
        { status: 400 }
      );
    }

    // Fetch the channel to get access token
    const channel = await channelService.getChannel(wid, channelId);
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const accessToken = channel.credentials.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found for channel" },
        { status: 400 }
      );
    }

    // Unsubscribe from webhook
    // await messengerService.unsubscribeFromWebhook(accessToken);

    // Remove channel from database
    await channelService.deleteChannel(wid, channelId);

    return NextResponse.json(
      { message: "Successfully unsubscribed from Facebook webhook" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during Facebook webhook unsubscribe:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
