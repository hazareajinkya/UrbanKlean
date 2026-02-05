import { plansConf } from "./utils/conf";

export const PLANS = {
  all_in_one: {
    id: "all_in_one",
    name: "All in One",
    description:
      "Everything you need to automate your customer support and boost revenue.",
    maxMessages: 10000,
    tiers: [
      {
        messages: 10000,
        price: { inr: 13999, usd: 249 },
        id: "all_in_one_10k_monthly",
        billingCycle: "monthly",
        priceIds: {
          razorpay: plansConf.allInOne.monthly.razorpayPlanId,
          polar: plansConf.allInOne.monthly.polarProductId,
        },
      },
      {
        messages: 10000,
        price: { inr: 119988, usd: 2388 },
        id: "all_in_one_10k_annually",
        billingCycle: "annually",
        priceIds: {
          razorpay: plansConf.allInOne.annually.razorpayPlanId,
          polar: plansConf.allInOne.annually.polarProductId,
        },
      },
    ],
    features: [
      "Everything in All in One",
      "AI Revenue Engine (EFRO)",
      "Automations (refunds, exchanges, cancellations)",
      "Zero-Repetition Memory",
      "Workflows",
      "Deep Commerce Integrations",
      "Priority Response Model",
      "Insights Dashboard",
      "Brand Guardrails",
      "Unlimited Agents",
      "API Access",
    ],
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime Deal",
    description: "One-time payment for lifetime access to MagicalCX",
    maxMessages: 10000,
    tiers: [
      {
        messages: 10000,
        price: { inr: 79999, usd: 999 },
        id: "lifetime_10k",
        billingCycle: "lifetime",
        priceIds: {
          razorpay: null,
          polar: plansConf.lifetime.polarProductId,
        },
      },
    ],
    features: [
      "Lifetime Access to MagicalCX",
      "AI Revenue Engine (EFRO)",
      "Automations (refunds, exchanges, cancellations)",
      "Zero-Repetition Memory",
      "Workflows",
      "Deep Commerce Integrations",
      "Priority Response Model",
      "Insights Dashboard",
      "Brand Guardrails",
      "Unlimited Agents",
      "API Access",
      "10,000 messages included",
    ],
  },
} as const;

export const CREDIT_ADDON = {
  id: "credit_addon",
  name: "Message Credits",
  messagesPerUnit: 1000,
  price: { inr: 999, usd: 15 },
  productId: {
    polar: plansConf.creditAddon.polarProductId,
    razorpay: null,
  },
} as const;

export const getPlanByRazorpayPlanId = (razorpayPlanId: string) => {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    const tier = plan.tiers.find((t) => t.priceIds.razorpay === razorpayPlanId);
    if (tier) return { planId: planKey, planName: plan.name, tier };
  }
  return null;
};

export const getPlanByPolarProductId = (polarProductId: string) => {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    const tier = plan.tiers.find((t) => t.priceIds.polar === polarProductId);
    if (tier) return { planId: planKey, planName: plan.name, tier };
  }
  return null;
};

export const LIFETIME_PLAN = PLANS.lifetime;
