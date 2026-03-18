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
        tooltip:
          "1 message = 1 customer message or 1 AI reply. You get 10,000 per month; we notify you before you hit the limit and you can add credits anytime.",
      },
      {
        label: "EFRO revenue engine",
        tooltip: "Turns support into sales with helpful, timely upsells.",
      },
      {
        label: "Unlimited AI agents",
        tooltip:
          "Create unlimited AI agents for sales, support, onboarding, and more.",
      },
      {
        label: "Conversational memory",
        tooltip:
          "Remembers past chats, orders, and preferences so customers never repeat themselves.",
      },
      {
        label: "Unlimited AI actions",
        tooltip:
          "Run unlimited AI-powered actions across workflows to automate tasks and execute external API calls at scale.",
      },
      {
        label: "Omnichannel inbox",
        tooltip:
          "One inbox for web, WhatsApp, Instagram, Messenger, email, and Slack.",
      },
      {
        label: "Integrations",
        tooltip:
          "Connect your existing tools and APIs to sync data, automate actions, and keep workflows in one place.",
      },
      {
        label: "Workflows",
        tooltip:
          "Define trigger-based automation with step-by-step instructions. Run onboarding, returns, bookings, and custom API actions from natural-language triggers.",
      },
      {
        label: "Knowledge suite",
        tooltip:
          "Website scrape, PDFs, teach mode, and vector search—train your agent your way.",
      },
      {
        label: "Human handoff + guardrails",
        tooltip: "Escalate to humans with full context and brand-safe replies.",
      },
      {
        label: "CRM",
        tooltip:
          "Auto-built customer profiles from every conversation—no manual data entry.",
      },
      {
        label: "Identity resolution",
        tooltip:
          "Identifies and merges the same customer across WhatsApp, email, web, and more into one unified profile—no duplicate or fragmented records.",
      },
      {
        label: "Advance analytics",
        tooltip:
          "Deep dashboard analytics for trends, sentiment, resolution quality, and performance insights.",
      },
      {
        label: "Weekly Insights Reports",
        tooltip:
          "Automated weekly summaries with top questions, feature requests, pain points, and recommendations.",
      },
      {
        label: "White-glove onboarding",
        tooltip: "We help set up, train, and launch your agent fast.",
      },
      {
        label: "Phishing protection",
        tooltip:
          "AI monitors for sensitive data requests, credential attempts, and impersonation—blocks leaks, deflects safely, and never shares protected info.",
      },
      {
        label: "Dedicated success manager",
        tooltip:
          "A dedicated point of contact for setup, optimization, and ongoing best-practice guidance to get the most from MagicalCX.",
      },
      {
        label: "10 team seats",
        tooltip:
          "Invite up to 10 team members with Owner, Admin, or Member roles to collaborate on conversations and settings.",
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
        tooltip:
          "1 message = 1 customer message or 1 AI reply. You get 10,000 per month; we notify you before you hit the limit and you can add credits anytime.",
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
        label: "Unlimited AI agents",
        tooltip:
          "Create unlimited AI agents for sales, support, onboarding, and more.",
      },
      {
        label: "Conversational memory",
        tooltip:
          "Remembers past chats, orders, and preferences so customers never repeat themselves.",
      },
      {
        label: "Unlimited AI actions",
        tooltip:
          "Run unlimited AI-powered actions across workflows to automate tasks and execute external API calls at scale.",
      },
      {
        label: "Omnichannel inbox",
        tooltip:
          "One inbox for web, WhatsApp, Instagram, Messenger, email, and Slack.",
      },
      {
        label: "Integrations",
        tooltip:
          "Connect your existing tools and APIs to sync data, automate actions, and keep workflows in one place.",
      },
      {
        label: "Workflows",
        tooltip:
          "Define trigger-based automation with step-by-step instructions. Run onboarding, returns, bookings, and custom API actions from natural-language triggers.",
      },
      {
        label: "Knowledge suite",
        tooltip:
          "Website scrape, PDFs, teach mode, and vector search—train your agent your way.",
      },
      {
        label: "Human handoff + guardrails",
        tooltip: "Escalate to humans with full context and brand-safe replies.",
      },
      {
        label: "CRM",
        tooltip:
          "Auto-built customer profiles from every conversation—no manual data entry.",
      },
      {
        label: "Identity resolution",
        tooltip:
          "Identifies and merges the same customer across WhatsApp, email, web, and more into one unified profile—no duplicate or fragmented records.",
      },
      {
        label: "Advance analytics",
        tooltip:
          "Deep dashboard analytics for trends, sentiment, resolution quality, and performance insights.",
      },
      {
        label: "Weekly Insights Reports",
        tooltip:
          "Automated weekly summaries with top questions, feature requests, pain points, and recommendations.",
      },
      {
        label: "White-glove onboarding",
        tooltip: "We help set up, train, and launch your agent fast.",
      },
      {
        label: "Phishing protection",
        tooltip:
          "AI monitors for sensitive data requests, credential attempts, and impersonation—blocks leaks, deflects safely, and never shares protected info.",
      },
      {
        label: "Dedicated success manager",
        tooltip:
          "A dedicated point of contact for setup, optimization, and ongoing best-practice guidance to get the most from MagicalCX.",
      },
      {
        label: "10 team seats",
        tooltip:
          "Invite up to 10 team members with Owner, Admin, or Member roles to collaborate on conversations and settings.",
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
