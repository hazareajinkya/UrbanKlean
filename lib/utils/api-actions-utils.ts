import axios, { AxiosError } from "axios";
import { IAction } from "../types/actions";

export const executeAPIAction = async (
  action: IAction,
  params: Record<string, any>,
) => {
  // Prepare headers with authorization
  let headers = { ...action.headers };

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
  }

  // Prepare query parameters
  let queryParams: Record<string, any> = {};
  if (
    action.authorization.type === "api-key" &&
    action.authorization.apiKey?.location === "query"
  ) {
    queryParams[action.authorization.apiKey.key] =
      action.authorization.apiKey.value;
  }

  // Add input parameters based on request type
  const requestConfig = {
    url: action.apiUrl,
    method: action.requestType,
    headers,
    ...(action.requestType === "GET"
      ? { params: { ...params, ...queryParams } }
      : {}),
    ...(action.requestType !== "GET"
      ? { data: params, params: queryParams }
      : {}),
  };

  console.log("requestConfig: ", requestConfig);

  try {
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        `Error executing action ${action.name}:`,
        error.response?.data,
        error.response?.data.error.details.errors,
      );
      throw new Error(`Failed to execute action: ${action.name}`);
    }

    console.error(`Error executing action ${action.name}:`, error);
    throw new Error(`Failed to execute action: ${action.name}`);
  }
};
