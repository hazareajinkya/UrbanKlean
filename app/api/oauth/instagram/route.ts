import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import { INSTAGRAM_OAUTH_API_BASE, instaconf } from "@/lib/utils/conf";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import instaService from "@/lib/services/instagram/insta-service";
import storageService from "@/lib/services/storage-service";
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
    const body = new URLSearchParams({
      client_id: instaconf.appId,
      client_secret: instaconf.appSecret,
      grant_type: "authorization_code",
      redirect_uri: instaconf.redirectUri,
      code: validatedParams.code,
    });

    const tokenResponse = await axios.post(
      `${INSTAGRAM_OAUTH_API_BASE}/oauth/access_token`,
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, user_id } = tokenResponse.data;
    console.log("access_token: ", access_token);
    console.log("user_id: ", user_id);

    console.log("Short-lived token data:", tokenResponse.data);
    // TODO: The user_id should be saved to identify the Instagram account.

    if (!access_token) {
      throw new Error("Failed to retrieve short-lived access token.");
    }

    // Step 3: Get a long-lived access token
    const longLivedTokenResponse = await axios.get(
      `${instaconf.baseURL}/access_token`,
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: instaconf.appSecret,
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

    const data = await instaService.getProfile({
      accessToken: credentials.access_token,
    });

    if (data.profile_picture_url) {
      try {
        const response = await axios.get(data.profile_picture_url, {
          responseType: "arraybuffer",
        });
        const buffer = response.data;
        const contentType = response.headers["content-type"] || "image/jpeg";
        const fileName = `channels/${wid}/instagram/${user_id}.jpg`;

        const uploadResult = await storageService.uploadBuffer(
          buffer,
          fileName,
          contentType
        );
        data.profile_picture_url = uploadResult.downloadURL;
      } catch (e) {
        console.error("Failed to upload profile image to storage", e);
      }
    }

    const metadata = { ...data };

    await instaService.subscribeToWebhook({
      accessToken: credentials.access_token,
      instaUserId: metadata.id,
    });

    const channel = generateDefaultChannel(
      user_id,
      "instagram",
      credentials,
      metadata
    );

    await channelService.addChannel(wid, channel);

    return NextResponse.redirect(successUrl);
  } catch (error: unknown) {
    const msg =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: unknown; status?: number } }).response
        : null;
    console.error("Error during Instagram OAuth:", error);
    if (msg) console.error("Response:", msg.status, msg.data);
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
    await instaService.unsubscribeFromWebhook({
      accessToken: accessToken,
      instaUserId: channel.metadata.id,
    });

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
