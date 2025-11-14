import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

import { slackconf } from "@/lib/utils/conf";
import channelService from "@/lib/services/channel-service";
import { generateDefaultChannel } from "@/lib/types/channel";
import { getProtocol } from "@/lib/utils";

const slackAuthSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  state: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  console.log("Slack OAuth queryParams: ", queryParams);

  const wid = searchParams.get("state");

  const finishedUrl = `/workspaces/${wid}/channels`;

  const errorUrl = new URL(
    `${finishedUrl}?error=Missing authorization code`,
    req.nextUrl.origin
  );
  const successUrl = new URL(
    `${finishedUrl}?slack=success`,
    req.nextUrl.origin
  );
  successUrl.protocol = getProtocol(req);
  errorUrl.protocol = getProtocol(req);

  if (!wid) {
    throw new Error("Workspace ID is required");
  }

  try {
    const validatedParams = slackAuthSchema.parse(queryParams);

    if (validatedParams.error) {
      console.error(`Slack OAuth Error: ${validatedParams.error}`);
      return NextResponse.redirect(errorUrl);
    }

    if (!validatedParams.code) {
      return NextResponse.redirect(errorUrl);
    }

    // Step 2: Exchange the Code for an Access Token
    const tokenResponse = await axios.post(
      `${slackconf.baseURL}/oauth.v2.access`,
      new URLSearchParams({
        client_id: slackconf.clientId,
        client_secret: slackconf.clientSecret,
        code: validatedParams.code,
        redirect_uri: slackconf.redirectUri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = tokenResponse.data;
    console.log("Slack token data:", tokenData);

    if (!tokenData.ok) {
      throw new Error(`Slack OAuth Error: ${tokenData.error}`);
    }

    const { access_token, scope, bot_user_id, team, authed_user } = tokenData;

    if (!access_token) {
      throw new Error("Failed to retrieve access token.");
    }

    // Step 3: Get additional team and bot information
    const teamInfoResponse = await axios.get(`${slackconf.baseURL}/team.info`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const teamInfo = teamInfoResponse.data;
    console.log("Slack team info:", teamInfo);

    // Prepare credentials and metadata for storage
    const credentials = {
      access_token,
      scope,
      bot_user_id,
    };

    const metadata = {
      id: team.id,
      teamId: team.id,
      teamName: team.name,
      teamDomain: teamInfo.team?.domain || "",
      teamUrl: teamInfo.team?.url || "",
      teamIcon: teamInfo.team?.icon?.image_88 || "",
      authedUserId: authed_user.id,
      bot_user_id: bot_user_id,
      scope: scope,
    };

    // Step 4: Create and save channel
    const channel = generateDefaultChannel(
      team.id, // Use team ID as the unique identifier
      "slack",
      credentials,
      metadata
    );

    await channelService.addChannel(wid, channel);
    console.log("Slack channel saved successfully:", channel);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Error during Slack OAuth:", error);
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

    // TODO: Implement Slack channel disconnection logic
    // This should:
    // 1. Fetch the channel to get access token
    // 2. Revoke the OAuth token if needed
    // 3. Remove webhook subscriptions
    // 4. Delete channel from database

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

    // TODO: Revoke Slack OAuth token
    // await axios.post(`${slackconf.baseURL}/auth.revoke`, {
    //   token: accessToken
    // });

    // TODO: Remove webhook subscriptions if any

    // Remove channel from database
    await channelService.deleteChannel(wid, channelId);

    return NextResponse.json(
      { message: "Successfully disconnected Slack channel" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during Slack channel disconnect:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
