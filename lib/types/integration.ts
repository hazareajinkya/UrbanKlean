export type IntegrationType =
  | "shopify"
  | "gmail"
  | "slack"
  | "github"
  | "notion"
  | "google-sheets"
  | "google-drive"
  | "supabase"
  | "hubspot";

type Metadata = Record<string, string>;

interface Credentials {
  accessToken?: string | null;
  accessTokenExpiresAt?: string | null;
}

export interface IIntegration {
  id: string;
  wid: string;
  status: "active" | "inactive";
  type: IntegrationType;
  metadata?: Metadata;
  credentials?: Credentials;
  createdAt: string;
  updatedAt: string;
}
