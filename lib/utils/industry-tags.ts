import { toSlug, fromSlug } from "@/lib/utils";

export const INDUSTRY_TAGS: Record<string, string[]> = {
  // 🛍️ E-Commerce
  "e-commerce": [
    "vip",
    "wholesale",
    "repeat-customer",
    "high-spender",
    "discount-seeker",
    "influencer",
    "affiliate",
    "reseller",
    "high-return-rate",
    "blacklisted",
  ],

  // 💻 SaaS / B2B
  saas: [
    "trial",
    "free-tier",
    "pro-plan",
    "enterprise",
    "decision-maker",
    "churn-risk",
    "power-user",
    "partner",
    "competitor",
  ],

  // 🏠 Real Estate
  "real-estate": [
    "buyer",
    "seller",
    "tenant",
    "landlord",
    "investor",
    "agent",
    "cash-buyer",
    "pre-approved",
  ],

  // 🏥 Healthcare
  healthcare: [
    "new-patient",
    "existing-patient",
    "referral",
    "insurance",
    "self-pay",
    "minor",
    "waitlist",
  ],

  // 💼 Agency / Service
  agency: [
    "lead",
    "qualified-lead",
    "active-client",
    "retainer",
    "past-client",
    "late-payer",
    "referral-source",
  ],

  // 🌐 General (Base Layer)
  general: [
    "vip",
    "customer",
    "lead",
    "employee",
    "test-account",
    "media",
    "blocked",
  ],
};

export const getTagsForIndustry = (industry?: string) => {
  const generalTags = INDUSTRY_TAGS["general"];

  if (!industry) return generalTags;

  const normalizedInput = toSlug(industry);
  const key = Object.keys(INDUSTRY_TAGS).find(
    (k) => normalizedInput.includes(k) && k !== "general"
  );

  const industryTags = key ? INDUSTRY_TAGS[key] : [];

  // Merge & Deduplicate
  return Array.from(new Set([...generalTags, ...industryTags]));
};
