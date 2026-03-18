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

const logAxiosStageError = (
  stage: string,
  error: unknown,
  context: Record<string, unknown> = {},
) => {
  if (!axios.isAxiosError(error)) return;
  const responseData = error.response?.data as
    | {
        error?: {
          message?: string;
          type?: string;
          code?: number;
          error_subcode?: number;
          error_user_title?: string;
          error_user_msg?: string;
          fbtrace_id?: string;
        };
      }
    | undefined;
  const oauthError = responseData?.error;
  console.error(`[Instagram OAuth][${stage}]`, {
    ...context,
    method: error.config?.method,
    url: error.config?.url,
    status: error.response?.status,
    message: oauthError?.message ?? error.message,
    type: oauthError?.type,
    code: oauthError?.code,
    subcode: oauthError?.error_subcode,
    userTitle: oauthError?.error_user_title,
    userMessage: oauthError?.error_user_msg,
    traceId: oauthError?.fbtrace_id,
    data: error.response?.data,
  });
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const wid = searchParams.get("state");

  const finishedUrl = `/workspaces/${wid}/channels`;
  const errorUrl = new URL(
    `${finishedUrl}?error=Missing authorization code`,
    req.nextUrl.origin,
  );
  const successUrl = new URL(
    `${finishedUrl}?instagram=success`,
    req.nextUrl.origin,
  );
  errorUrl.protocol = getProtocol(req);
  successUrl.protocol = getProtocol(req);

  if (!wid) {
    throw new Error("Workspace ID is required");
  }

  try {
    const validatedParams = instagramAuthSchema.parse(queryParams);
    const logContext = {
      wid,
      hasCode: !!validatedParams.code,
      redirectUri: instaconf.redirectUri,
    };

    if (validatedParams.error) {
      console.error("[Instagram OAuth][auth_denied]", {
        ...logContext,
        reason: validatedParams.error_reason,
        description: validatedParams.error_description,
      });
      return NextResponse.redirect(errorUrl);
    }

    if (!validatedParams.code) {
      console.error("[Instagram OAuth][missing_code]", logContext);
      return NextResponse.redirect(errorUrl);
    }

    // Step 2: Exchange the Code For a Token
    const formData = new FormData();
    formData.append("client_id", instaconf.appId);
    formData.append("client_secret", instaconf.appSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", instaconf.redirectUri);
    formData.append("code", validatedParams.code);

    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        `${INSTAGRAM_OAUTH_API_BASE}/oauth/access_token`,
        formData,
      );
    } catch (error) {
      logAxiosStageError("code_exchange", error, logContext);
      throw error;
    }

    const shortLivedTokenData = Array.isArray(tokenResponse.data?.data)
      ? tokenResponse.data.data[0]
      : tokenResponse.data;
    const accessToken = shortLivedTokenData?.access_token as string | undefined;
    const userId = shortLivedTokenData?.user_id as string | undefined;

    if (!accessToken) {
      console.error("[Instagram OAuth][missing_short_lived_token]", {
        ...logContext,
        response: tokenResponse.data,
      });
      throw new Error("Failed to retrieve short-lived access token.");
    }

    // Step 3: Get a long-lived access token
    let longLivedTokenResponse;
    try {
      longLivedTokenResponse = await axios.get(
        `${instaconf.baseURL}/access_token`,
        {
          params: {
            grant_type: "ig_exchange_token",
            client_secret: instaconf.appSecret,
            access_token: accessToken,
          },
        },
      );
    } catch (error) {
      logAxiosStageError("long_lived_exchange", error, logContext);
      throw error;
    }

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
        const fileName = `workspaces/${wid}/channels/instagram/${userId ?? "profile"}.jpg`;

        const uploadResult = await storageService.uploadBuffer(
          buffer,
          fileName,
          contentType,
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
      userId ?? metadata.id,
      "instagram",
      credentials,
      metadata,
    );

    await channelService.addChannel(wid, channel);

    return NextResponse.redirect(successUrl);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logAxiosStageError("unhandled", error, { wid });
    } else {
      console.error("[Instagram OAuth][unhandled]", { wid, error });
    }
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
        { status: 400 },
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
        { status: 400 },
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
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during Instagram webhook unsubscribe:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
