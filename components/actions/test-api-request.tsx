import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Play, Send, X } from "lucide-react";
import {
  IActionInput,
  IRequestType,
  IActionAuthorization,
} from "@/lib/types/actions";
import axios from "axios";
import { capitalize } from "@/lib/utils";

interface TestApiRequestProps {
  url: string;
  method: IRequestType;
  inputs: IActionInput[];
  headers: Array<{ key: string; value: string }>;
  authorization: IActionAuthorization;
  onClose: () => void;
}

const TestApiRequest: React.FC<TestApiRequestProps> = ({
  url,
  method,
  inputs,
  headers,
  authorization,
  onClose,
}) => {
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTestingRequest, setIsTestingRequest] = useState(false);
  const [testInputValues, setTestInputValues] = useState<Record<string, any>>(
    {}
  );

  const getNestedValue = (path: string[]) =>
    path.reduce(
      (acc, key) =>
        acc && typeof acc === "object" && key in acc ? acc[key] : undefined,
      testInputValues as any
    );

  const setNestedValue = (path: string[], value: any) => {
    setTestInputValues((prev) => {
      const next = { ...prev };
      let cursor: any = next;
      path.forEach((key, index) => {
        if (index === path.length - 1) {
          cursor[key] = value;
          return;
        }
        cursor[key] =
          cursor[key] && typeof cursor[key] === "object"
            ? { ...cursor[key] }
            : {};
        cursor = cursor[key];
      });
      return next;
    });
  };

  const buildPayload = (
    inputsList: IActionInput[],
    parentPath: string[] = []
  ): Record<string, any> =>
    inputsList.reduce((acc, input) => {
      if (!input.key) return acc;
      const path = [...parentPath, input.key];
      if (input.type === "object") {
        const nested = buildPayload(input.children || [], path);
        if (Object.keys(nested).length || input.required) {
          acc[input.key] = nested;
        }
        return acc;
      }
      const value = getNestedValue(path);
      if (value !== undefined && value !== "") acc[input.key] = value;
      return acc;
    }, {} as Record<string, any>);

  const getMissingRequiredInputs = (
    inputsList: IActionInput[],
    parentPath: string[] = []
  ): string[] =>
    inputsList.flatMap((input) => {
      if (!input.key) return [];
      const path = [...parentPath, input.key];
      if (input.type === "object") {
        const nested = buildPayload(input.children || [], path);
        const missing = getMissingRequiredInputs(input.children || [], path);
        if (input.required && !Object.keys(nested).length)
          return [path.join("."), ...missing];
        return missing;
      }
      const value = getNestedValue(path);
      return input.required && (value === undefined || value === "")
        ? [path.join(".")]
        : [];
    });

  const renderInputs = (
    inputsList: IActionInput[],
    parentPath: string[] = []
  ) =>
    inputsList.map((input, index) => {
      const path = [...parentPath, input.key];
      const inputKey =
        input.key && path.join(".")
          ? path.join(".")
          : `${parentPath.join(".") || "root"}-${index}`;
      if (input.type === "object") {
        return (
          <div key={inputKey} className="space-y-2">
            <div className="flex items-center justify-between space-x-2 mb-1.5">
              <Label className="text-sm gap-1">
                {input.key}
                {input.required && <span className="text-red-500">*</span>}
              </Label>
              <span className="text-xs text-muted-foreground text-right">
                {capitalize(input.type)}
              </span>
            </div>
            <div className="border rounded-md bg-muted/30 p-3 space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">
                Object variables for {input.key || "object"}
              </Label>
              {input.children?.length ? (
                renderInputs(input.children, path)
              ) : (
                <p className="text-xs text-muted-foreground">
                  No object variables added yet.
                </p>
              )}
            </div>
            {input.description && (
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {input.description}
              </p>
            )}
          </div>
        );
      }
      return (
        <div key={inputKey} className="space-y-1">
          <div className="flex items-center justify-between space-x-2 mb-1.5">
            <Label className="text-sm gap-1">
              {input.key}
              {input.required && <span className="text-red-500">*</span>}
            </Label>
            <span className="text-xs text-muted-foreground text-right">
              {capitalize(input.type)}
            </span>
          </div>
          {input.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={getNestedValue(path) || false}
                onChange={(e) => setNestedValue(path, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">
                {getNestedValue(path) ? "true" : "false"}
              </span>
            </div>
          ) : (
            <Input
              type={
                input.type === "number"
                  ? "number"
                  : input.type === "url"
                  ? "url"
                  : "text"
              }
              value={getNestedValue(path) || ""}
              onChange={(e) =>
                setNestedValue(
                  path,
                  input.type === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              placeholder={`Enter ${input.key}...`}
              className="mt-1"
            />
          )}
          {input.description && (
            <p className="text-xs text-right mt-1 text-muted-foreground">
              {input.description}
            </p>
          )}
        </div>
      );
    });

  const handleTestRequest = async () => {
    if (!url) {
      setTestResponse({
        error: "URL is required to test the request",
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if all required inputs are provided
    const missingRequiredInputs = getMissingRequiredInputs(inputs);

    if (missingRequiredInputs.length > 0) {
      setTestResponse({
        error: `Required inputs missing: ${missingRequiredInputs
          .map((input) => input)
          .join(", ")}`,
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setIsTestingRequest(true);
    setTestResponse(null);

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {};

      // Add custom headers
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Add authorization headers
      if (authorization.type === "api-key" && authorization.apiKey) {
        if (authorization.apiKey.location === "header") {
          requestHeaders[authorization.apiKey.key] = authorization.apiKey.value;
        }
      } else if (
        authorization.type === "bearer-token" &&
        authorization.bearerToken
      ) {
        requestHeaders[
          "Authorization"
        ] = `Bearer ${authorization.bearerToken.token}`;
      }

      // Prepare request config
      const config: any = {
        method: method.toLowerCase(),
        url: url,
        headers: requestHeaders,
        timeout: 10000, // 10 second timeout
      };

      // Prepare query parameters and request body based on inputs
      const queryParams: Record<string, any> = {};
      const requestBody: Record<string, any> = {};
      const payload = buildPayload(inputs);
      if (method === "GET") Object.assign(queryParams, payload);
      else Object.assign(requestBody, payload);

      // Add query parameters for API key in query location
      if (
        authorization.type === "api-key" &&
        authorization.apiKey &&
        authorization.apiKey.location === "query"
      ) {
        queryParams[authorization.apiKey.key] = authorization.apiKey.value;
      }

      // Set query parameters if any exist
      if (Object.keys(queryParams).length > 0) {
        config.params = queryParams;
      }

      // Set request body for POST/PUT/DELETE requests
      if (method !== "GET" && Object.keys(requestBody).length > 0) {
        config.data = requestBody;
      }

      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();

      setTestResponse({
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const endTime = Date.now();
      setTestResponse({
        success: false,
        error: error.message,
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Network Error",
        headers: error.response?.headers || {},
        data: error.response?.data || null,
        responseTime: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingRequest(false);
    }
  };

  const missingRequired = getMissingRequiredInputs(inputs);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Test Request</h3>
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="pl-4 w-min"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Input Values Collection */}
      {inputs.length === 0 ? (
        <div className="border rounded-md p-4 bg-muted/50 text-center text-sm text-muted-foreground">
          No parameters required — you can send the request directly.
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Test Input Values{" "}
            {method === "GET" ? "(Query Parameters)" : "(Request Body)"}
          </Label>
          <div className="border rounded-md p-4 space-y-3 bg-white">
            {renderInputs(inputs)}
          </div>
        </div>
      )}

      {/* Send Request Button - always visible */}
      <div className="">
        <Button
          onClick={handleTestRequest}
          variant={"outline"}
          disabled={isTestingRequest || !url || missingRequired.length > 0}
          style={{ background: "#ffffff" }}
          className="w-full gap-2 bg-white"
        >
          {isTestingRequest ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isTestingRequest ? "Sending..." : "Send Request"}
        </Button>
      </div>

      {testResponse && (
        <div className="border rounded-md p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  testResponse.success ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm font-medium">
                {testResponse.status} {testResponse.statusText}
              </span>
              {testResponse.responseTime > 0 && (
                <span className="text-xs text-gray-500">
                  ({testResponse.responseTime}ms)
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(testResponse.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {testResponse.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{testResponse.error}</p>
            </div>
          )}

          {testResponse.data && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Response</Label>
              <div className="bg-gray-50 border rounded-md p-3 max-h-40 overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {typeof testResponse.data === "string"
                    ? testResponse.data
                    : JSON.stringify(testResponse.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {testResponse.headers &&
            Object.keys(testResponse.headers).length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Response Headers</Label>
                <div className="bg-gray-50 border rounded-md p-3 max-h-32 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {JSON.stringify(testResponse.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TestApiRequest;
