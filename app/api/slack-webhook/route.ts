import { NextResponse } from "next/server";
import slackParser from "@/lib/services/slack/slack-webhook-parser";
import { successResponse } from "@/lib/types/api-response";
import { SLACK_SIGNING_SECRET } from "@/lib/constants";
import crypto from "crypto";
import channelService from "@/lib/services/channel-service";
import slackService from "@/lib/services/slack/slack-service";
import slackBotService from "@/lib/services/slack/slack-bot-service";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("Slack webhook POST request received");

    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Get headers for signature verification
    const slackSignature = req.headers.get("x-slack-signature");
    const slackTimestamp = req.headers.get("x-slack-request-timestamp");
    // Check for retry attempts - skip if retry count is more than 1
    const retryNum = req.headers.get("x-slack-retry-num");

    if (retryNum && parseInt(retryNum) > 0) {
      console.log(`Skipping retry attempt ${retryNum} due to retry limit.`);
      return NextResponse.json(
        { message: "Retry limit exceeded" },
        { status: 200 }
      );
    }

    // Verify Slack signature (uncomment in production)
    if (!slackSignature || !slackTimestamp) {
      console.error("Missing Slack signature headers");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!verifySlackSignature(rawBody, slackSignature, slackTimestamp)) {
      console.error("Invalid Slack signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle URL verification challenge
    if (body.type === "url_verification") {
      console.log("URL verification challenge received");
      return NextResponse.json({ challenge: body.challenge });
    }

    // Handle event callbacks
    if (body.type === "event_callback") {
      const event = body.event;
      console.log("EVENT TYPE: ", event);

      // Handle app_mention events
      if (event.type === "app_mention") {
        console.log("App mention event received:", event);

        // Parse the app mention
        const msg = slackParser.parseAppMentionMessage(body);

        if (!msg) {
          console.log("Failed to parse app mention message");
          return successResponse(200, "Failed to parse message");
        }

        console.log("Parsed message:", msg);

        // Generate AI response
        const { success, message: ans } =
          await slackBotService.generateResponse(
            msg,
            body.team_id,
            msg.user,
            "slack"
          );

        if (success && ans) {
          //   // Send response back to Slack channel
          await slackService.sendMessage(msg.channel, ans, msg.team);
        }
      }
    }

    return successResponse(200, "Webhook processed successfully");
  } catch (error) {
    console.error("Error processing Slack webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 200 }
    );
  }
}

export async function GET(req: Request) {
  // Slack doesn't use GET for webhook verification like WhatsApp/Facebook
  // This is mainly for health checks
  return NextResponse.json({ status: "Slack webhook endpoint is active" });
}

function verifySlackSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  if (!SLACK_SIGNING_SECRET) {
    console.error("SLACK_SIGNING_SECRET is not set");
    return false;
  }

  // Check if the timestamp is recent (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    console.error("Request timestamp is too old");
    return false;
  }

  // Create signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${crypto
    .createHmac("sha256", SLACK_SIGNING_SECRET)
    .update(sigBasestring, "utf8")
    .digest("hex")}`;

  return crypto.timingSafeEqual(
    Buffer.from(mySignature, "utf8"),
    Buffer.from(signature, "utf8")
  );
}
