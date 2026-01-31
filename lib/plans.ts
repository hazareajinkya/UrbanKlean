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

  growth: {
    id: "growth",
    name: "Growth",
    description: "Perfect for growing brands getting started with MagicalCX.",
    maxMessages: 10000, // Growth caps at 10K
    tiers: [
      {
        messages: 5000,
        price: { inr: 9900, usd: 99 },
        id: "growth_5k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1msfdjk4hcsc9ry6tjk2kb",
          razorpay: "plan_S0ucywKrTQyOtd",
          polar: "42f12571-1107-4ac3-a7cb-291f0e3db87b",
        },
      },
      {
        messages: 10000,
        price: { inr: 14900, usd: 149 },
        id: "growth_10k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mt13cq7xs4r5k3g5mm2s2",
          razorpay: "plan_S0udQKkiRc30OX",
          polar: "876c54dd-f455-4eaa-adc7-660fdef9780a",
        },
      },
    ],
    features: [
      "1 AI Agent",
      "Omnichannel Inbox",
      "Basic Memory",
      "Order Tracking",
      "Basic FAQs & Policies",
      "1 Workspace",
      "Standard Response Model",
      "Business Hours Controls",
    ],
  },
  scale: {
    id: "scale",
    name: "Scale",
    description:
      "Automation, revenue boosts, and advanced CX for teams that want to move faster.",
    maxMessages: null, // No cap until enterprise
    tiers: [
      {
        messages: 5000,
        price: { inr: 16900, usd: 169 },
        id: "scale_5k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mv6erwkfcazcp4xw6y1e5",
          razorpay: "",
          polar: "",
        },
      },
      {
        messages: 10000,
        price: { inr: 19900, usd: 199 },
        id: "scale_10k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mw2vb2a27yf2bs5phshh8",
          razorpay: "",
          polar: "",
        },
      },
      {
        messages: 15000,
        price: { inr: 22900, usd: 229 },
        id: "scale_15k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mwnfng0y9sfwqn0xmqch0",
          razorpay: "",
          polar: "",
        },
      },
      {
        messages: 20000,
        price: { inr: 25900, usd: 259 },
        id: "scale_20k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mx7yw2m42726y49wqpzb6",
          razorpay: "",
          polar: "",
        },
      },
      {
        messages: 25000,
        price: { inr: 28900, usd: 289 },
        id: "scale_25k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1mxn498qhsb7fhway6ea5f",
          razorpay: "",
          polar: "",
        },
      },
      {
        messages: 30000,
        price: { inr: 31900, usd: 319 },
        id: "scale_30k_monthly",
        billingCycle: "monthly",
        priceIds: {
          paddle: "pri_01kc1my82mrddwgat580shdfz9",
          razorpay: "",
          polar: "",
        },
      },
    ],
    features: [
      "Everything in Growth",
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
