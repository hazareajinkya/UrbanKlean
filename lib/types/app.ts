export type AppAuthType =
  | "oauth2"
  | "apiKey"
  | "bearerToken"
  | "basic"
  | "custom";

export type AppStatus = "draft" | "published";

export interface OAuth2AuthConfig {
  type: "oauth2";
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl: string | null;
  scopes: string[];
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  pkce: boolean;
  additionalParams: Record<string, string>;
}

export interface ApiKeyAuthConfig {
  type: "apiKey";
  keyName: string;
  keyValue: string;
  in: "header" | "query";
  valuePrefix: string | null;
}

export interface BearerTokenAuthConfig {
  type: "bearerToken";
  token: string;
}

export interface BasicAuthConfig {
  type: "basic";
  username: string;
  password: string;
}

export interface CustomAuthConfig {
  type: "custom";
  fields: Record<string, string>;
}

export type AppAuthConfig =
  | OAuth2AuthConfig
  | ApiKeyAuthConfig
  | BearerTokenAuthConfig
  | BasicAuthConfig
  | CustomAuthConfig;

export interface IApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  categories: string[];
  authType: AppAuthType;
  authConfig: AppAuthConfig;
  baseUrl: string;
  apiVersion: string;
  defaultHeaders: Record<string, string>;
  documentationUrl: string;
  status: AppStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IAppTestResult {
  success: boolean;
  testedUrl: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  message: string;
}

export interface IOAuthTokenSet {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  scope: string | null;
  tokenType: string | null;
  expiresAt: string | null;
}

export interface IInstalledApp {
  id: string;
  appId: string;
  appSlug: string;
  workspaceId: string;
  authType: AppAuthType;
  status: "pending" | "connected" | "disconnected" | "error";
  tokens: IOAuthTokenSet | null;
  credentials: Record<string, string> | null;
  lastError: string | null;
  connectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
