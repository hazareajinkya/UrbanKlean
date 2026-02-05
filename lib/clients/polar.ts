import { Polar } from "@polar-sh/sdk";
import { CREDIT_ADDON, LIFETIME_PLAN } from "../plans";

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

export interface PolarCreditPurchaseCustomData {
  userId: string;
  userEmail: string;
  quantity: number;
  type: "credit_purchase";
}

export interface PolarLifetimePurchaseCustomData {
  userId: string;
  userEmail: string;
  type: "lifetime_purchase";
  planId: string;
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
    }
    // else {
    //   // Revoke immediately
    //   await polar.subscriptions.revoke({
    //     id: subscriptionId,
    //   });

    //   // Get updated subscription
    //   return this.getSubscription(subscriptionId);
    // }
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

  async createCreditCheckout(arg: {
    productId: string;
    quantity: number;
    customerEmail?: string;
    customerId?: string;
    successUrl: string;
    metadata: PolarCreditPurchaseCustomData;
  }) {
    const polar = getPolarInstance();

    if (arg.quantity < 1 || arg.quantity > 50) {
      throw new Error(
        `Invalid quantity: ${arg.quantity}. Quantity must be between 1 and 50.`
      );
    }

    const priceAmountCents = Math.round(
      CREDIT_ADDON.price.usd * 100 * arg.quantity
    );
    if (priceAmountCents < 50 || priceAmountCents > 99_999_999) {
      throw new Error(
        `Invalid price amount: ${priceAmountCents} cents. Must be between 50 and 99,999,999.`
      );
    }

    try {
      const result = await polar.checkouts.create({
        products: [arg.productId],
        prices: {
          [arg.productId]: [
            {
              amountType: "fixed",
              priceAmount: priceAmountCents,
              priceCurrency: "usd",
            },
          ],
        },
        customerEmail: arg.customerEmail,
        customerId: arg.customerId,
        successUrl: arg.successUrl,
        metadata: {
          userId: arg.metadata.userId,
          userEmail: arg.metadata.userEmail,
          quantity: arg.metadata.quantity.toString(),
          type: arg.metadata.type,
        },
      });
      return {
        id: result.id,
        url: result.url || "",
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { detail?: unknown } } })
          .response;
        const detail = res?.data?.detail;
        if (detail != null) {
          throw new Error(
            `Polar checkout creation failed: ${JSON.stringify(detail)}`
          );
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create Polar checkout session");
    }
  },

  async createLifetimeCheckout(arg: {
    productId: string;
    customerEmail?: string;
    customerId?: string;
    successUrl: string;
    metadata: PolarLifetimePurchaseCustomData;
  }) {
    const polar = getPolarInstance();

    const tier = LIFETIME_PLAN.tiers[0];
    const priceAmountCents = tier.price.usd * 100;
    if (priceAmountCents < 50 || priceAmountCents > 99_999_999) {
      throw new Error(
        `Invalid price amount: ${priceAmountCents} cents. Must be between 50 and 99,999,999.`
      );
    }

    try {
      const result = await polar.checkouts.create({
        products: [arg.productId],
        prices: {
          [arg.productId]: [
            {
              amountType: "fixed",
              priceAmount: priceAmountCents,
              priceCurrency: "usd",
            },
          ],
        },
        customerEmail: arg.customerEmail,
        customerId: arg.customerId,
        successUrl: arg.successUrl,
        metadata: {
          userId: arg.metadata.userId,
          userEmail: arg.metadata.userEmail,
          type: arg.metadata.type,
          planId: arg.metadata.planId,
        },
      });
      return {
        id: result.id,
        url: result.url || "",
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { detail?: unknown } } })
          .response;
        const detail = res?.data?.detail;
        if (detail != null) {
          throw new Error(
            `Polar lifetime checkout creation failed: ${JSON.stringify(detail)}`
          );
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create Polar lifetime checkout session");
    }
  },
};
