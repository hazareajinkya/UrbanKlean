export const MESSAGE_TIERS = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000,
] as const;

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
          paddle: "pri_01kc1msfdjk4hcsc9ry6tjk2kb",
          razorpay: "plan_S0ucywKrTQyOtd",
          polar: "42f12571-1107-4ac3-a7cb-291f0e3db87b",
        },
      },
      {
        messages: 10000,
        price: { inr: 9999, usd: 199 },
        id: "all_in_one_10k_annually",
        billingCycle: "annually",
        priceIds: {
          paddle: "pri_01kc1mt13cq7xs4r5k3g5mm2s2",
          razorpay: "plan_S0udQKkiRc30OX",
          polar: "876c54dd-f455-4eaa-adc7-660fdef9780a",
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
        price: { inr: 49999, usd: 599 },
        id: "lifetime_10k",
        billingCycle: "lifetime",
        priceIds: {
          paddle: null,
          razorpay: null,
          polar: "8b578923-7362-4570-b206-0c6c38ec81d5",
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
  }
} as const;

export const CREDIT_ADDON = {
  id: "credit_addon",
  name: "Message Credits",
  messagesPerUnit: 1000,
  price: { inr: 999, usd: 15 },
  productId: {
    polar: "524874f5-8d38-4ff8-8638-4dc8a638e1c6",
    razorpay: null,
  },
} as const;



export const getPlanByPaddlePriceId = (priceId: string) => {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    const tier = plan.tiers.find((t) => t.priceIds.paddle === priceId);
    if (tier) return { planId: planKey, planName: plan.name, tier };
  }
  return null;
};

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
