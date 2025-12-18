// API Base URLs
export const FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com";
export const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com";
export const INSTAGRAM_OAUTH_API_BASE = "https://api.instagram.com";
export const SLACK_API_BASE = "https://slack.com/api";
export const POSTMARK_API_BASE = "https://api.postmarkapp.com";
export const RESEND_API_BASE = "https://api.resend.com";

// WhatsApp Configuration
export const WA_WINDOW_EXPIRATION_HOURS = 24;
export const WA_PHONE_ID = "848214531709464";

// Facebook Configuration
export const FB_ID = process.env.NEXT_PUBLIC_FB_ID ?? "";
export const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID ?? "";
export const FB_APP_SECRET = process.env.FB_APP_SECRET ?? "";
export const FB_REDIRECT_URI = process.env.NEXT_PUBLIC_FB_REDIRECT_URI ?? "";

// Instagram Configuration
export const INSTA_ID = process.env.NEXT_PUBLIC_INSTA_ID ?? "";
export const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ?? "";
export const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? "";
export const INSTAGRAM_REDIRECT_URI =
  process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ??
  "http://localhost:3000/api/oauth/instagram";

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

// API Configs
export const waconf = {
  version: "v24.0",
  phoneID: WA_PHONE_ID,
  accessToken: process.env.WA_ACCESS_TOKEN,
  expirationWindow: WA_WINDOW_EXPIRATION_HOURS,
  baseURL: FACEBOOK_GRAPH_API_BASE,
};

export const coreConf = {
  isProd: process.env.NEXT_PUBLIC_ENV === "production",
};

export const instaconf = {
  version: "v23.0",
  id: INSTA_ID,
  accessToken: process.env.INSTA_IG_ACCESS_TOKEN,
  baseURL: INSTAGRAM_GRAPH_API_BASE,
  appId: INSTAGRAM_APP_ID,
  appSecret: INSTAGRAM_APP_SECRET,
  redirectUri: INSTAGRAM_REDIRECT_URI,
};

export const fbconf = {
  version: "v23.0",
  id: FB_ID,
  accessToken: process.env.FB_MESSENGER_ACCESS_TOKEN,
  baseURL: FACEBOOK_GRAPH_API_BASE,
  appId: FB_APP_ID,
  appSecret: FB_APP_SECRET,
  redirectUri: FB_REDIRECT_URI,
};

export const slackconf = {
  appId: SLACK_APP_ID,
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET,
  signingSecret: SLACK_SIGNING_SECRET,
  redirectUri: SLACK_REDIRECT_URI,
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
