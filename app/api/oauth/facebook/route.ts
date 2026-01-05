import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import { fbconf } from "@/lib/utils/conf";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import messengerService from "@/lib/services/messenger/messenger-service";
import { getProtocol } from "@/lib/utils";
import storageService from "@/lib/services/storage-service";

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
      `${fbconf.baseURL}/${fbconf.version}/oauth/access_token`,
      {
        params: {
          client_id: fbconf.appId,
          redirect_uri: fbconf.redirectUri,
          client_secret: fbconf.appSecret,
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
    const appAccessToken = `${fbconf.appId}|${fbconf.appSecret}`;
    const debugResponse = await axios.get(
      `${fbconf.baseURL}/${fbconf.version}/debug_token`,
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

    if (tokenData.app_id !== fbconf.appId) {
      throw new Error("Access token does not belong to this app");
    }

    const user_id = tokenData.user_id;

    // Step 4: Get pages list (System User has access to pages)
    const pages = await messengerService.getPages(access_token);

    console.log("Facebook pages:", pages);

    if (!pages || pages.length === 0) {
      throw new Error(
        "No Facebook pages found. Please ensure the System User has access to at least one page."
      );
    }

    // Use the first page (you can modify this to let user select a page)
    const selectedPage = pages[0];
    const pageId = selectedPage.id;
    const pageAccessToken = selectedPage.access_token;

    if (!pageId || !pageAccessToken) {
      throw new Error("Failed to get page ID or access token");
    }

    // Extract picture URL from page data (already included in /me/accounts response)
    let profile_pic = selectedPage.picture?.data?.url || null;

    console.log("Selected Facebook page:", {
      id: pageId,
      name: selectedPage.name,
      hasPicture: !!profile_pic,
    });

    if (profile_pic) {
      try {
        const response = await axios.get(profile_pic, {
          responseType: "arraybuffer",
        });
        const buffer = response.data;
        const contentType = response.headers["content-type"] || "image/jpeg";
        const fileName = `channels/${wid}/facebook/${user_id}.jpg`;

        const uploadResult = await storageService.uploadBuffer(
          buffer,
          fileName,
          contentType
        );
        profile_pic = uploadResult.downloadURL;
      } catch (e) {
        console.error("Failed to upload profile image to storage", e);
      }
    }

    // Store System User token and Page Access Token
    const credentials = {
      access_token: access_token, // System User token (for getting pages)
      page_access_token: pageAccessToken, // Page Access Token (for Messenger API)
      token_type,
      expires_in,
    };

    // Store page info in metadata, including the Page ID
    // Use data from /me/accounts response (no need for additional API call)
    const metadata = {
      id: pageId,
      name: selectedPage.name,
      profile_pic,
      system_user_id: user_id,
    };

    // Step 6: Subscribe to webhook using Page ID and Page Access Token
    try {
      await messengerService.subscribeToWebhook({
        pageId,
        accessToken: pageAccessToken,
      });
    } catch (error) {
      console.warn("Warning: Could not subscribe to webhook:", error);
      // Continue even if webhook subscription fails
    }

    // Step 7: Create and save channel
    const channel = generateDefaultChannel(
      pageId, // Use pageId as providerAccountId instead of user_id
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

    const pageAccessToken =
      (channel.credentials.page_access_token as string) ||
      (channel.credentials.access_token as string);
    const pageId = channel.metadata.id as string;

    if (!pageAccessToken || !pageId) {
      return NextResponse.json(
        { error: "No page access token or page ID found for channel" },
        { status: 400 }
      );
    }

    // Unsubscribe from webhook
    try {
      await messengerService.unsubscribeFromWebhook({
        pageId,
        accessToken: pageAccessToken,
      });
    } catch (error) {
      console.warn("Warning: Could not unsubscribe from webhook:", error);
      // Continue even if webhook unsubscription fails
    }

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
