import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PaddleSubscriptionData } from "@/lib/clients/paddle";
import paymentService from "@/lib/services/payment-service";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const signatureHeader = req.headers.get("paddle-signature");
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      console.error("Missing Paddle signature or webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();

    if (!verifyPaddleSignature(rawBody, signatureHeader, webhookSecret)) {
      console.error("Invalid Paddle webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    console.log("Paddle webhook event received:", {
      eventId: event.event_id,
      eventType: event.event_type,
      occurredAt: event.occurred_at,
    });

    const eventType = event.event_type;
    const eventData = event.data as PaddleSubscriptionData;

    switch (eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(eventData);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(eventData);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(eventData);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Paddle webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function verifyPaddleSignature(
  body: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const parts: Record<string, string> = {};
    signatureHeader.split(";").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        parts[key.trim()] = value.trim();
      }
    });

    const timestamp = parts.ts;
    const signature = parts.h1;

    if (!timestamp || !signature) {
      console.error("Missing timestamp or signature in Paddle header");
      return false;
    }

    const timestampNum = parseInt(timestamp, 10);
    if (isNaN(timestampNum)) {
      console.error("Invalid timestamp format");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - timestampNum);

    if (timeDifference > 300) {
      console.error("Request timestamp is too old (replay attack prevention)");
      return false;
    }

    const signedPayload = `${timestamp}:${body}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying Paddle signature:", error);
    return false;
  }
}

async function handleSubscriptionCreated(data: PaddleSubscriptionData) {
  await paymentService.handleSubscriptionCreated(data);
}

async function handleSubscriptionUpdated(data: PaddleSubscriptionData) {
  await paymentService.handleSubscriptionUpdated(data);
}

async function handleSubscriptionCanceled(data: PaddleSubscriptionData) {
  await paymentService.handleSubscriptionCanceled(data);
}
