import Razorpay from "razorpay";
import { razorpayconf } from "../utils/conf";

// Server-side Razorpay instance
let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = razorpayconf.keyId;
  const keySecret = razorpayconf.keySecret;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not set");
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
};

// Razorpay Subscription Types
export interface RazorpaySubscriptionData {
  id: string;
  entity: "subscription";
  plan_id: string;
  start_at: number;
  status:
    | "created"
    | "authenticated"
    | "active"
    | "pending"
    | "halted"
    | "cancelled"
    | "completed"
    | "expired"
    | "paused";
  current_start: number;
  current_end: number;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string>;
  charge_at: number;
  offer_id: string | null;
  short_url: string;
  has_scheduled_changes: boolean;
  change_scheduled_at: number | null;
  source: string;
  payment_method: string;
  customer_id: string;
  created_at: number;
}

export interface RazorpaySubscriptionCustomData {
  userId: string;
  userEmail: string;
  planId: string;
  tier: string;
  tierId: string;
}

export interface RazorpayCreditPurchaseCustomData {
  userId: string;
  userEmail: string;
  quantity: number;
  type: "credit_purchase";
}

export interface RazorpayLifetimePurchaseCustomData {
  userId: string;
  userEmail: string;
  type: "lifetime_purchase";
  planId: string;
}

export interface RazorpaySubscriptionOrderCustomData {
  userId: string;
  userEmail: string;
  quantity: number;
  type: "subscription";
  subscriptionId: string;
  planId: string;
  tier: string;
  tierId: string;
}

export type RazorpayOrderCustomData =
  | RazorpayCreditPurchaseCustomData
  | RazorpayLifetimePurchaseCustomData
  | RazorpaySubscriptionOrderCustomData;

// Map Razorpay status to your app status
export const mapRazorpayStatus = (
  status: RazorpaySubscriptionData["status"]
): "active" | "canceled" | "past_due" | "paused" | "trialing" => {
  switch (status) {
    case "active":
      return "active";
    case "authenticated":
    case "created":
      return "trialing";
    case "cancelled":
    case "completed":
    case "expired":
      return "canceled";
    case "halted":
    case "pending":
      return "past_due";
    case "paused":
      return "paused";
    default:
      return "canceled";
  }
};

// Razorpay API helper functions
export const razorpayApi = {
  async createSubscription(arg: {
    planId: string;
    customerId?: string;
    totalCount: number;
    notes: RazorpaySubscriptionCustomData;
    startAt?: number;
  }) {
    const razorpay = getRazorpayInstance();

    const params: any = {
      plan_id: arg.planId,
      total_count: arg.totalCount,
      quantity: 1,
      notes: arg.notes as unknown as Record<string, string>,
    };

    if (arg.startAt) {
      params.start_at = arg.startAt;
    }

    if (arg.customerId) {
      params.customer_notify = 1;
    }
    return razorpay.subscriptions.create(params);
  },

  async getSubscription(subscriptionId: string) {
    const razorpay = getRazorpayInstance();
    return razorpay.subscriptions.fetch(subscriptionId);
  },

  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = true) {
    const razorpay = getRazorpayInstance();

    return razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
  },

  async pauseSubscription(subscriptionId: string) {
    const razorpay = getRazorpayInstance();
    return razorpay.subscriptions.pause(subscriptionId, {
      pause_at: "now",
    });
  },

  async resumeSubscription(subscriptionId: string) {
    const razorpay = getRazorpayInstance();
    return razorpay.subscriptions.resume(subscriptionId, {
      resume_at: "now",
    });
  },

  async createOrder(arg: {
    amount: number; // Amount in paise (INR * 100)
    currency: string;
    notes: RazorpayOrderCustomData;
  }) {
    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: arg.amount,
      currency: arg.currency,
      notes: arg.notes as unknown as Record<string, string>,
    });

    return order;
  },
};
