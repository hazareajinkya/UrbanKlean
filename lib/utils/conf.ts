// API Base URLs
export const FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com";
export const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com";
export const INSTAGRAM_OAUTH_API_BASE = "https://api.instagram.com";
export const SLACK_API_BASE = "https://slack.com/api";
export const POSTMARK_API_BASE = "https://api.postmarkapp.com";
export const RESEND_API_BASE = "https://api.resend.com";

// WhatsApp Configuration
export const WA_WINDOW_EXPIRATION_HOURS = 24;
export const WA_PHONE_ID = "859793977226436";

// Facebook Configuration
export const FB_ID = process.env.NEXT_PUBLIC_FB_ID ?? "";
export const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID ?? "";
export const FB_APP_SECRET = process.env.FB_APP_SECRET ?? "";
export const FB_CONFIG_ID = process.env.NEXT_PUBLIC_FB_CONFIG_ID ?? "";

// Instagram Configuration
export const INSTA_ID = process.env.NEXT_PUBLIC_INSTA_ID ?? "";
export const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ?? "";
export const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? "";

// Slack OAuth Configuration
export const SLACK_APP_ID = process.env.NEXT_PUBLIC_SLACK_APP_ID ?? "";
export const SLACK_CLIENT_ID = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ?? "";
export const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET ?? "";
export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET ?? "";
export const SLACK_REDIRECT_URI =
  process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI ??
  "http://localhost:3000/api/oauth/slack";

// Slack webhook verification
export const SLACK_WEBHOOK_VERIFY_TOKEN =
  process.env.SLACK_WEBHOOK_VERIFY_TOKEN ?? "";

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
export const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

export const coreConf = {
  isProd: process.env.NEXT_PUBLIC_ENV === "production",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "",
};

export const companyAddress = {
  line1: "8 The Green STE D",
  city: "Dover",
  region: "County of Kent, Delaware",
  zip: "19901",
};

// API Configs
export const waconf = {
  version: "v23.0",
  phoneID: WA_PHONE_ID,
  accessToken: process.env.WA_ACCESS_TOKEN,
  expirationWindow: WA_WINDOW_EXPIRATION_HOURS,
  baseURL: FACEBOOK_GRAPH_API_BASE,
  appId: FB_APP_ID,
  appSecret: FB_APP_SECRET,
  redirectUri: `https://www.magicalcx.com/api/oauth/whatsapp`,
};

export const instaconf = {
  version: "v23.0",
  id: INSTA_ID,
  accessToken: process.env.INSTA_IG_ACCESS_TOKEN,
  baseURL: INSTAGRAM_GRAPH_API_BASE,
  appId: INSTAGRAM_APP_ID,
  appSecret: INSTAGRAM_APP_SECRET,
  redirectUri: `${coreConf.baseUrl}/api/oauth/instagram`,
};

export const fbconf = {
  version: "v24.0",
  id: FB_ID,
  accessToken: process.env.FB_MESSENGER_ACCESS_TOKEN,
  baseURL: FACEBOOK_GRAPH_API_BASE,
  appId: FB_APP_ID,
  appSecret: FB_APP_SECRET,
  redirectUri: `${coreConf.baseUrl}/api/oauth/facebook`,
  configId: FB_CONFIG_ID,
};

export const slackconf = {
  appId: SLACK_APP_ID,
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET,
  signingSecret: SLACK_SIGNING_SECRET,
  redirectUri: `${coreConf.baseUrl}/api/oauth/slack`,
  webhookVerifyToken: SLACK_WEBHOOK_VERIFY_TOKEN,
  baseURL: SLACK_API_BASE,
};

export const postmarkconf = {
  baseURL: POSTMARK_API_BASE,
  accountToken: process.env.POSTMARK_ACCOUNT_TOKEN ?? "",
  serverToken: process.env.POSTMARK_SERVER_TOKEN ?? "",
};

export const resendconf = {
  baseURL: RESEND_API_BASE,
  apiKey: process.env.RESEND_API_KEY ?? "",
};

export const blogconf = {
  baseUrl: process.env.BLOG_API_URL ?? "",
  apiKey: process.env.BLOG_API_KEY ?? "",
};

export const backendconf = {
  accessToken: process.env.BACKEND_API_KEY,
  baseURL: process.env.BACKEND_URL,
};

export const razorpayconf = {
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
  webHookSecret: RAZORPAY_KEY_SECRET,
};

export const plansConf = {
  allInOne: {
    monthly: {
      razorpayPlanId:
        process.env.NEXT_PUBLIC_ALLINONE_MONTHLY_RAZORPAY_PLAN_ID ?? "",
      polarProductId:
        process.env.NEXT_PUBLIC_ALLINONE_MONTHLY_POLAR_PRODUCT_ID ?? "",
    },
    annually: {
      razorpayPlanId:
        process.env.NEXT_PUBLIC_ALLINONE_ANNUALLY_RAZORPAY_PLAN_ID ?? "",
      polarProductId:
        process.env.NEXT_PUBLIC_ALLINONE_ANNUALLY_POLAR_PRODUCT_ID ?? "",
    },
  },

  creditAddon: {
    polarProductId: process.env.NEXT_PUBLIC_CREDIT_ADDON_POLAR_PRODUCT_ID ?? "",
  },

  lifetime: {
    polarProductId: process.env.NEXT_PUBLIC_LIFETIME_POLAR_PRODUCT_ID ?? "",
  },
};
