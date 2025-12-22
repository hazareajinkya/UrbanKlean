import {
  initializePaddle as initPaddle,
  getPaddleInstance,
  Paddle,
} from "@paddle/paddle-js";
import axios from "axios";

let paddleInstance: Paddle | undefined = undefined;

export const initializePaddle = async (): Promise<Paddle | undefined> => {
  if (typeof window === "undefined") return undefined;

  if (paddleInstance) {
    return paddleInstance;
  }

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!clientToken) {
    console.error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set");
    return undefined;
  }

  try {
    paddleInstance = await initPaddle({
      token: clientToken,
      environment:
        process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    return paddleInstance;
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    return undefined;
  }
};

export const getPaddle = (): Paddle | undefined => {
  if (!paddleInstance) {
    paddleInstance = getPaddleInstance();
  }
  return paddleInstance;
};

// Paddle Webhook Types
export interface PaddleSubscriptionData {
  id: string;
  status: "active" | "canceled" | "past_due" | "paused" | "trialing";
  customer_id: string;
  address_id?: string;
  business_id?: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  first_billed_at?: string;
  next_billed_at?: string;
  paused_at?: string;
  canceled_at?: string;
  collection_mode: "automatic" | "manual";
  billing_cycle?: {
    interval: "day" | "week" | "month" | "year";
    frequency: number;
  };
  current_billing_period?: {
    starts_at: string;
    ends_at: string;
  };
  billing_details?: {
    enable_checkout: boolean;
    purchase_order_number?: string;
    additional_information?: string;
    payment_terms?: string;
  };
  items: Array<{
    price_id: string;
    price?: {
      id: string;
      product_id: string;
      description?: string;
      type: "standard" | "custom";
      billing_cycle?: {
        interval: "day" | "week" | "month" | "year";
        frequency: number;
      };
      trial_period?: {
        interval: "day" | "week" | "month" | "year";
        frequency: number;
      };
      tax_mode: "account_setting" | "external" | "internal";
    };
    quantity: number;
    previously_billed_at?: string;
    previously_billed_amount?: string;
    next_billed_at?: string;
    recently_ended_at?: string;
  }>;
  custom_data?: Record<string, unknown>;
  management_urls?: {
    cancel: string;
    update_payment_method: string;
  };
  details?: {
    collection_method?: "automatic" | "manual";
    tax_rates?: Array<{
      id: string;
      name: string;
      rate: string;
    }>;
  };
}

export interface PaddleSubscriptionCustomData {
  userId: string;
  userEmail: string;
  planId: string;
  tier: string;
  tierId: string;
}

// Server-side Paddle API client
const getPaddleApiClient = () => {
  const apiKey = process.env.PADDLE_API_KEY;
  const environment =
    process.env.NODE_ENV === "production" ? "production" : "sandbox";
  const baseURL =
    environment === "production"
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set");
  }

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
};

export const paddleApi = {
  async getSubscription(subscriptionId: string) {
    const client = getPaddleApiClient();
    const { data } = await client.get(`/subscriptions/${subscriptionId}`);
    return data.data as PaddleSubscriptionData;
  },

  async updateSubscription(
    subscriptionId: string,
    items: Array<{ price_id: string; quantity: number }>,
    prorationBillingMode:
      | "prorated_immediately"
      | "full_immediately"
      | "do_not_bill" = "prorated_immediately"
  ) {
    const client = getPaddleApiClient();
    const { data } = await client.patch(`/subscriptions/${subscriptionId}`, {
      items,
      proration_billing_mode: prorationBillingMode,
    });
    return data.data as PaddleSubscriptionData;
  },
};
