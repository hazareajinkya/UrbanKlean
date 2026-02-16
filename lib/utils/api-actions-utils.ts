import axios from "axios";
import { IAction } from "../types/actions";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../clients/firebase";
import { IInstalledApp } from "../types/app";
import { decrypt } from "./encryption";

const getParentAuthHeaders = async (
  action: IAction,
): Promise<Record<string, string>> => {
  const parentAuth = action.authorization.parentAuth;
  if (!parentAuth) return {};

  const integrationsRef = collection(db, `workspaces/${action.wid}/apps`);
  const q = query(
    integrationsRef,
    where("appSlug", "==", parentAuth.appSlug),
    limit(1),
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    console.error(
      `[parent-auth] No installed app found for slug: ${parentAuth.appSlug}`,
    );
    return {};
  }

  const installedApp = snap.docs[0].data() as IInstalledApp;
  const headers: Record<string, string> = {};

  switch (installedApp.authType) {
    case "oauth2":
      if (installedApp.credentials?.accessToken) {
        headers.Authorization = `Bearer ${decrypt(installedApp.credentials.accessToken)}`;
      }
      break;
    case "bearerToken":
      if (installedApp.credentials?.token) {
        headers.Authorization = `Bearer ${decrypt(installedApp.credentials.token)}`;
      }
      break;
    case "apiKey":
      if (
        installedApp.credentials?.keyName &&
        installedApp.credentials?.keyValue
      ) {
        const prefix = installedApp.credentials?.valuePrefix
          ? decrypt(installedApp.credentials.valuePrefix)
          : "";

        headers[decrypt(installedApp.credentials.keyName)] = prefix
          ? `${prefix} ${decrypt(installedApp.credentials.keyValue)}`
          : decrypt(installedApp.credentials.keyValue);
      }
      break;
    case "basic":
      if (
        installedApp.credentials?.username &&
        installedApp.credentials?.password
      ) {
        const username = decrypt(installedApp.credentials.username);
        const password = decrypt(installedApp.credentials.password);
        headers.Authorization = `Basic ${Buffer.from(
          `${username}:${password}`,
        ).toString("base64")}`;
      }
      break;
    default:
      console.warn(
        `[parent-auth] Unsupported authType: ${installedApp.authType}`,
      );
  }

  console.log(
    "[parent-auth] resolved headers for authType:",
    installedApp.authType,
  );
  return headers;
};

export const executeAPIAction = async (
  action: IAction,
  params: Record<string, any>,
) => {
  // Prepare headers with authorization
  let headers: Record<string, string> = { ...action.headers };

  console.log(
    "[executeAPIAction] authorization:",
    JSON.stringify(action.authorization),
  );

  if (action.authorization.type === "api-key" && action.authorization.apiKey) {
    if (action.authorization.apiKey.location === "header") {
      headers[action.authorization.apiKey.key] =
        action.authorization.apiKey.value;
    }
  } else if (
    action.authorization.type === "bearer-token" &&
    action.authorization.bearerToken
  ) {
    headers.Authorization = `Bearer ${action.authorization.bearerToken.token}`;
  } else if (
    action.authorization.type === "basic" &&
    action.authorization.basic
  ) {
    const { username, password } = action.authorization.basic;
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  } else if (
    action.authorization.type === "parent-auth" &&
    action.authorization.parentAuth
  ) {
    const parentHeaders = await getParentAuthHeaders(action);
    headers = { ...headers, ...parentHeaders };
  }

  console.log("[executeAPIAction] final headers:", JSON.stringify(headers));

  // Prepare query parameters
  let queryParams: Record<string, any> = {};
  if (
    action.authorization.type === "api-key" &&
    action.authorization.apiKey?.location === "query"
  ) {
    queryParams[action.authorization.apiKey.key] =
      action.authorization.apiKey.value;
  }

  // For integration actions, automatically include wid in params
  const actionParams =
    action.type === "integration" ? { ...params, wid: action.wid } : params;

  // Add input parameters based on request type1
  const requestConfig = {
    url: action.apiUrl,
    method: action.requestType,
    headers,
    ...(action.requestType === "GET"
      ? { params: { ...actionParams, ...queryParams } }
      : {}),
    ...(action.requestType !== "GET"
      ? { data: actionParams, params: queryParams }
      : {}),
  };

  try {
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (error) {
    console.error(
      `Error executing action ${action.name}:`,
      JSON.stringify(error),
    );
    throw new Error(`Failed to execute action: ${action.name}`);
  }
};
