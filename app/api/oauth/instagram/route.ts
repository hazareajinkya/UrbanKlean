import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  INSTAGRAM_REDIRECT_URI,
} from "@/lib/constants";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import instaService from "@/lib/services/instagram/insta-service";
import { getProtocol } from "@/lib/utils";

const instagramAuthSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
  state: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  console.log("queryParams: ", queryParams);

  const wid = searchParams.get("state");

  const finishedUrl = `/workspaces/${wid}/channels`;
  const errorUrl = new URL(
    `${finishedUrl}?error=Missing authorization code`,
    req.nextUrl.origin
  );
  const successUrl = new URL(
    `${finishedUrl}?instagram=success`,
    req.nextUrl.origin
  );
  errorUrl.protocol = getProtocol(req);
  successUrl.protocol = getProtocol(req);

  if (!wid) {
    throw new Error("Workspace ID is required");
  }

  try {
    const validatedParams = instagramAuthSchema.parse(queryParams);

    if (validatedParams.error) {
      console.error(
        `Instagram OAuth Error: ${validatedParams.error_reason} - ${validatedParams.error_description}`
      );
      return NextResponse.redirect(errorUrl);
    }

    if (!validatedParams.code) {
      return NextResponse.redirect(errorUrl);
    }

    // Step 2: Exchange the Code For a Token
    const tokenFormData = new FormData();
    tokenFormData.append("client_id", INSTAGRAM_APP_ID);
    tokenFormData.append("client_secret", INSTAGRAM_APP_SECRET);
    tokenFormData.append("grant_type", "authorization_code");
    tokenFormData.append("redirect_uri", INSTAGRAM_REDIRECT_URI);
    tokenFormData.append("code", validatedParams.code);

    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      tokenFormData
    );

    const { access_token, user_id } = tokenResponse.data;

    console.log("Short-lived token data:", tokenResponse.data);
    // TODO: The user_id should be saved to identify the Instagram account.

    if (!access_token) {
      throw new Error("Failed to retrieve short-lived access token.");
    }

    // Step 3: Get a long-lived access token
    const longLivedTokenResponse = await axios.get(
      "https://graph.instagram.com/access_token",
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: INSTAGRAM_APP_SECRET,
          access_token,
        },
      }
    );

    console.log("Long-lived token data:", longLivedTokenResponse.data);

    /* 
      TODO: Save the following to the database, associated with the current user:
      - longLivedTokenResponse.data.access_token (the long-lived token)
      - longLivedTokenResponse.data.expires_in (number of seconds until token expires)
      - user_id (from the short-lived token response)
    */

    const credentials = {
      access_token: longLivedTokenResponse.data.access_token,
      expires_in: longLivedTokenResponse.data.expires_in,
    };

    const data = await instaService.getProfile(credentials.access_token);

    const metadata = { ...data };

    await instaService.subscribeToWebhook(credentials.access_token);

    const channel = generateDefaultChannel(
      user_id,
      "instagram",
      credentials,
      metadata
    );

    await channelService.addChannel(wid, channel);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Error during Instagram OAuth:", error);
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
    await instaService.unsubscribeFromWebhook(accessToken);

    // Remove channel from database
    await channelService.deleteChannel(wid, channelId);

    return NextResponse.json(
      { message: "Successfully unsubscribed from Instagram webhook" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during Instagram webhook unsubscribe:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
