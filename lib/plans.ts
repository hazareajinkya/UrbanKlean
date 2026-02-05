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
      {
        label: "10,000 messages/month",
        tooltip: "Includes 10,000 AI messages each month. Add credits anytime.",
      },
      {
        label: "EFRO revenue engine",
        tooltip: "Turns support into sales with helpful, timely upsells.",
      },
      {
        label: "Unlimited agents",
        tooltip:
          "Create unlimited agents for sales, support, onboarding, and more.",
      },
      {
        label: "Omnichannel inbox",
        tooltip:
          "One inbox for web, WhatsApp, Instagram, Messenger, email, and Slack.",
      },
      {
        label: "Zero-repeat memory",
        tooltip: "Remembers past conversations so customers never repeat info.",
      },
      {
        label: "Workflows + actions",
        tooltip: "Automate refunds, cancellations, bookings, and call APIs.",
      },
      {
        label: "CRM + identity resolution",
        tooltip: "Auto-built customer profiles merged across channels.",
      },
      {
        label: "Insights + weekly reports",
        tooltip:
          "Dashboard and weekly summaries for questions, sentiment, and wins.",
      },
      {
        label: "White-glove onboarding",
        tooltip: "We help set up, train, and launch your agent fast.",
      },
      {
        label: "Phishing protection",
        tooltip: "Detects sensitive requests and blocks data leaks.",
      },
      {
        label: "Human handoff + guardrails",
        tooltip: "Escalate to humans with full context and brand-safe replies.",
      },
      {
        label: "Knowledge suite",
        tooltip: "Website scrape, PDFs, teach mode, and embeddings.",
      },
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
      {
        label: "10,000 messages/month",
        tooltip: "Includes 10,000 AI messages each month. Add credits anytime.",
      },
      {
        label: "Lifetime access",
        tooltip: "One-time payment for lifetime access to MagicalCX.",
      },
      {
        label: "EFRO revenue engine",
        tooltip: "Turns support into sales with helpful, timely upsells.",
      },
      {
        label: "Unlimited agents",
        tooltip:
          "Create unlimited agents for sales, support, onboarding, and more.",
      },
      {
        label: "Omnichannel inbox",
        tooltip:
          "One inbox for web, WhatsApp, Instagram, Messenger, email, and Slack.",
      },
      {
        label: "Zero-repeat memory",
        tooltip: "Remembers past conversations so customers never repeat info.",
      },
      {
        label: "Workflows + actions",
        tooltip: "Automate refunds, cancellations, bookings, and call APIs.",
      },
      {
        label: "CRM + identity resolution",
        tooltip: "Auto-built customer profiles merged across channels.",
      },
      {
        label: "Insights + weekly reports",
        tooltip:
          "Dashboard and weekly summaries for questions, sentiment, and wins.",
      },
      {
        label: "White-glove onboarding",
        tooltip: "We help set up, train, and launch your agent fast.",
      },
      {
        label: "Phishing protection",
        tooltip: "Detects sensitive requests and blocks data leaks.",
      },
      {
        label: "Human handoff + guardrails",
        tooltip: "Escalate to humans with full context and brand-safe replies.",
      },
      {
        label: "Knowledge suite",
        tooltip: "Website scrape, PDFs, teach mode, and embeddings.",
      },
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
