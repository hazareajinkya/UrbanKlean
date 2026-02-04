import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { RazorpaySubscriptionData } from "@/lib/clients/razorpay";
import paymentService from "@/lib/services/payment-service";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing Razorpay signature or webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();

    if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    const eventType = event.event;

    console.log("Razorpay webhook event:", {
      eventType,
      paymentNotes: event.payload?.payment?.entity?.notes,
    });


    if (eventType === "payment.captured") {
      const paymentData = event.payload?.payment?.entity;
      if (paymentData?.notes?.type === "credit_purchase") {
        await handleCreditPurchase(paymentData);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      if (paymentData?.notes?.type === "lifetime_purchase") {
        await handleLifetimePurchase(paymentData);
        return NextResponse.json({ received: true }, { status: 200 });
      }

    }

    const subscriptionData = event.payload?.subscription
      ?.entity as RazorpaySubscriptionData;

    if (!subscriptionData) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    switch (eventType) {
      case "subscription.authenticated":
      case "subscription.activated":
        await handleSubscriptionActivated(subscriptionData);
        break;
      case "subscription.charged":
        await handleSubscriptionCharged(subscriptionData);
        break;
      case "subscription.pending":
      case "subscription.halted":
        await handleSubscriptionPending(subscriptionData);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(subscriptionData);
        break;
      case "subscription.paused":
        await handleSubscriptionPaused(subscriptionData);
        break;
      case "subscription.resumed":
        await handleSubscriptionResumed(subscriptionData);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`, { event });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch (error) {
    console.error("Error verifying Razorpay signature:", error);
    return false;
  }
}

async function handleSubscriptionActivated(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionActivated(data);
}

async function handleSubscriptionCharged(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionCharged(data);
}

async function handleSubscriptionPending(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionPending(data);
}

async function handleSubscriptionCancelled(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionCancelled(data);
}

async function handleSubscriptionPaused(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionPaused(data);
}

async function handleSubscriptionResumed(data: RazorpaySubscriptionData) {
  await paymentService.handleRazorpaySubscriptionResumed(data);
}

async function handleCreditPurchase(paymentData: any) {
  const notes = paymentData.notes || {};
  if (notes.type === "credit_purchase") {
    await paymentService.handleRazorpayCreditPurchase({
      paymentId: paymentData.id,
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      notes: notes as Record<string, string>,
    });
  }
}

async function handleLifetimePurchase(paymentData: any) {
  const notes = paymentData.notes || {};
  if (notes.type === "lifetime_purchase") {
    await paymentService.handleRazorpayLifetimePurchase({
      paymentId: paymentData.id,
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      notes: notes as Record<string, string>,
    });
  }
}
