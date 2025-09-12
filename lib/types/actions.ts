import { v4 } from "uuid";

export interface IAction {
  id: string;
  wid: string;

  name: string;
  slug: string;
  description: string;
  type: IActionType;

  apiUrl: string;
  requestType: IRequestType;
  headers: Record<string, string>;
  authorization: IActionAuthorization;
  inputs: IActionInput[];

  createdAt: string;
  updatedAt: string;
}

export type IActionAuthorization = {
  type: "none" | "api-key" | "bearer-token";
  apiKey?: {
    key: string;
    value: string;
    location: "header" | "query";
  };
  bearerToken?: {
    token: string;
  };
};
export type IRequestType = "GET" | "POST" | "PUT" | "DELETE";
export type IActionInput = {
  key: string;
  type: "string" | "number" | "boolean" | "url";
  required: boolean;
  description?: string;
};

export type IActionType = "internal" | "user" | "integration";

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
  inputs: IActionInput[]
): IAction => {
  return {
    id: v4(),
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
