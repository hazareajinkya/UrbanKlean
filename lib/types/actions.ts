import { v4 } from "uuid";

export type IActionApp = {
  id: string;
  slug?: string;
  name: string;
  icon: string;
};

export interface IAction {
  id: string;
  wid: string;

  name: string;
  slug: string;
  description: string;
  type: IActionType;
  app?: IActionApp;
  originalId?: string;
  apiUrl: string;
  requestType: IRequestType;
  headers: Record<string, string>;
  authorization: IActionAuthorization;
  inputs: IActionInput[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}
export type IActionIntegration = "shopify" | "none";
export type IActionParentAuth = {
  appId: string;
  appSlug: string;
  appAuthType: string;
};

export type IActionAuthorization = {
  type: "none" | "api-key" | "bearer-token" | "parent-auth" | "basic";
  apiKey?: {
    key: string;
    value: string;
    location: "header" | "query";
  };
  bearerToken?: {
    token: string;
  };
  basic?: {
    username: string;
    password: string;
  };
  parentAuth?: IActionParentAuth;
};
export type IRequestType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type IActionInput = {
  key: string;
  type: "string" | "number" | "boolean" | "url" | "object" | "array";
  required: boolean;
  description?: string;
  children?: IActionInput[];
};

export type IActionType = "internal" | "user" | "integration" | "app-action";

export const generateDefaultAction = (
  wid: string,
  name: string,
  slug: string,
  description: string,
  type: IActionType,
  apiUrl: string,
  authorization: IActionAuthorization,
  requestType: IRequestType,
  headers: Record<string, string>,
  inputs: IActionInput[],
): IAction => {
  return {
    id: v4(),
    status: "active",
    wid,
    name,
    slug,
    type,
    authorization,
    requestType,
    apiUrl,
    description,
    headers,
    inputs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
