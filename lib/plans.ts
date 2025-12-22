export const MESSAGE_TIERS = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000,
] as const;

export const PLANS = {
  growth: {
    id: "growth",
    name: "Growth",
    description: "Perfect for growing brands getting started with MagicalCX.",
    maxMessages: 10000, // Growth caps at 10K
    tiers: [
      {
        messages: 5000,
        price: 99,
        id: "growth_5k_monthly",
        paddlePriceId: "pri_01kc1msfdjk4hcsc9ry6tjk2kb",
      },
      {
        messages: 10000,
        price: 149,
        id: "growth_10k_monthly",
        paddlePriceId: "pri_01kc1mt13cq7xs4r5k3g5mm2s2",
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
        price: 169,
        id: "scale_5k_monthly",
        paddlePriceId: "pri_01kc1mv6erwkfcazcp4xw6y1e5",
      },
      {
        messages: 10000,
        price: 199,
        id: "scale_10k_monthly",
        paddlePriceId: "pri_01kc1mw2vb2a27yf2bs5phshh8",
      },
      {
        messages: 15000,
        price: 229,
        id: "scale_15k_monthly",
        paddlePriceId: "pri_01kc1mwnfng0y9sfwqn0xmqch0",
      },
      {
        messages: 20000,
        price: 259,
        id: "scale_20k_monthly",
        paddlePriceId: "pri_01kc1mx7yw2m42726y49wqpzb6",
      },
      {
        messages: 25000,
        price: 289,
        id: "scale_25k_monthly",
        paddlePriceId: "pri_01kc1mxn498qhsb7fhway6ea5f",
      },
      {
        messages: 30000,
        price: 319,
        id: "scale_30k_monthly",
        paddlePriceId: "pri_01kc1my82mrddwgat580shdfz9",
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

export const getPlanByPriceId = (priceId: string) => {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    const tier = plan.tiers.find((t) => t.paddlePriceId === priceId);
    if (tier) return { planId: planKey, planName: plan.name, tier };
  }
  return null;
};
