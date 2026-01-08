import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { PolarSubscriptionData } from "@/lib/clients/polar";
import paymentService from "@/lib/services/payment-service";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing Polar webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    let event;
    try {
      event = validateEvent(rawBody, headers, webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("Invalid Polar webhook signature:", error);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
      throw error;
    }

    console.log("Polar webhook event received:", {
      eventType: event.type,
      timestamp: event.timestamp,
    });

    const eventType = event.type;
    const eventData = event.data;

    switch (eventType) {
      case "subscription.created":
      case "subscription.active":
        await handleSubscriptionActive(eventData as any);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(eventData as any);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(eventData as any);
        break;
      case "subscription.revoked":
        await handleSubscriptionRevoked(eventData as any);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Polar webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function mapSubscriptionToPolarData(data: any): PolarSubscriptionData {
  return {
    id: data.id,
    status: data.status,
    customerId: data.customerId || data.customer?.id || "",
    productId: data.productId || data.product?.id || "",
    priceId: data.prices?.[0]?.id || "",
    currentPeriodStart:
      typeof data.currentPeriodStart === "string"
        ? data.currentPeriodStart
        : data.currentPeriodStart?.toISOString() || new Date().toISOString(),
    currentPeriodEnd:
      data.currentPeriodEnd === null
        ? null
        : typeof data.currentPeriodEnd === "string"
        ? data.currentPeriodEnd
        : data.currentPeriodEnd?.toISOString() || null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
    canceledAt:
      data.canceledAt === null
        ? null
        : typeof data.canceledAt === "string"
        ? data.canceledAt
        : data.canceledAt?.toISOString() || null,
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : data.createdAt?.toISOString() || new Date().toISOString(),
    metadata: (data.metadata || {}) as Record<
      string,
      string | number | boolean
    >,
  };
}

async function handleSubscriptionActive(data: any) {
  const subscriptionData = mapSubscriptionToPolarData(data);
  await paymentService.handlePolarSubscriptionCreated(subscriptionData);
}

async function handleSubscriptionUpdated(data: any) {
  const subscriptionData = mapSubscriptionToPolarData(data);
  await paymentService.handlePolarSubscriptionUpdated(subscriptionData);
}

async function handleSubscriptionCanceled(data: any) {
  const subscriptionData = mapSubscriptionToPolarData(data);
  await paymentService.handlePolarSubscriptionCanceled(subscriptionData);
}

async function handleSubscriptionRevoked(data: any) {
  await handleSubscriptionCanceled(data);
}
