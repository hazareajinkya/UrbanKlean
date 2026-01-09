import { Polar } from "@polar-sh/sdk";

let polarInstance: Polar | null = null;

export const getPolarInstance = (): Polar => {
  if (polarInstance) return polarInstance;

  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }

  polarInstance = new Polar({
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    accessToken,
  });

  return polarInstance;
};

export interface PolarSubscriptionData {
  id: string;
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "trialing"
    | "incomplete"
    | "incomplete_expired"
    | "unpaid"
    | "paused";
  customerId: string;
  productId: string;
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PolarSubscriptionCustomData {
  userId: string;
  userEmail: string;
  planId: string;
  tier: string;
  tierId: string;
}

export const mapPolarStatus = (
  status: PolarSubscriptionData["status"]
): "active" | "canceled" | "past_due" | "paused" | "trialing" => {
  switch (status) {
    case "active":
      return "active";
    case "canceled":
    case "incomplete_expired":
    case "unpaid":
      return "canceled";
    case "past_due":
    case "incomplete":
      return "past_due";
    case "paused":
      return "paused";
    case "trialing":
      return "trialing";
    default:
      return "canceled";
  }
};

export const polarApi = {
  async createCheckoutSession(arg: {
    productId: string;
    customerEmail?: string;
    customerId?: string;
    successUrl: string;
    metadata: PolarSubscriptionCustomData;
  }) {
    const polar = getPolarInstance();

    const result = await polar.checkouts.create({
      products: [arg.productId],
      customerEmail: arg.customerEmail,
      customerId: arg.customerId,
      successUrl: arg.successUrl,
      metadata: {
        userId: arg.metadata.userId,
        userEmail: arg.metadata.userEmail,
        planId: arg.metadata.planId,
        tier: arg.metadata.tier,
        tierId: arg.metadata.tierId,
      },
    });

    return {
      id: result.id,
      url: result.url || "",
    };
  },

  async getSubscription(subscriptionId: string) {
    const polar = getPolarInstance();

    const result = await polar.subscriptions.get({
      id: subscriptionId,
    });

    const firstPrice = result.prices[0];
    return {
      id: result.id,
      status: result.status,
      customerId: result.customerId,
      productId: result.productId,
      priceId: firstPrice?.id || "",
      currentPeriodStart: result.currentPeriodStart.toISOString(),
      currentPeriodEnd: result.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: result.cancelAtPeriodEnd,
      canceledAt: result.canceledAt?.toISOString() || null,
      createdAt: result.createdAt.toISOString(),
      metadata: result.metadata as Record<string, string | number | boolean>,
    } as PolarSubscriptionData;
  },

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const polar = getPolarInstance();

    if (cancelAtPeriodEnd) {
      const result = await polar.subscriptions.update({
        id: subscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: true,
        },
      });

      const firstPrice = result.prices[0];
      return {
        id: result.id,
        status: result.status,
        customerId: result.customerId,
        productId: result.productId,
        priceId: firstPrice?.id || "",
        currentPeriodStart: result.currentPeriodStart.toISOString(),
        currentPeriodEnd: result.currentPeriodEnd?.toISOString() || null,
        cancelAtPeriodEnd: result.cancelAtPeriodEnd,
        canceledAt: result.canceledAt?.toISOString() || null,
        createdAt: result.createdAt.toISOString(),
        metadata: result.metadata as Record<string, string | number | boolean>,
      } as PolarSubscriptionData;
    } else {
      // Revoke immediately
      await polar.subscriptions.revoke({
        id: subscriptionId,
      });

      // Get updated subscription
      return this.getSubscription(subscriptionId);
    }
  },

  async createCustomerPortalSession(arg: { customerId: string }) {
    const polar = getPolarInstance();

    const result = await polar.customerSessions.create({
      customerId: arg.customerId,
    });

    return {
      url: result.customerPortalUrl || "",
    };
  },
};
