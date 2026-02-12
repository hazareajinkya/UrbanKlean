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
import { Textarea } from "@/components/ui/textarea";

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
    const missingRequiredInputs = inputs
      .filter((input) => input.required)
      .filter(
        (input) =>
          !testInputValues[input.key] || testInputValues[input.key] === ""
      );

    if (missingRequiredInputs.length > 0) {
      setTestResponse({
        error: `Required inputs missing: ${missingRequiredInputs
          .map((input) => input.key)
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

      // Add input values based on request method
      const buildNestedValues = (
        inputDefs: IActionInput[],
        values: Record<string, any>,
        prefix: string = ""
      ): Record<string, any> => {
        const result: Record<string, any> = {};
        inputDefs.forEach((input) => {
          const key = prefix ? `${prefix}.${input.key}` : input.key;
          if (input.type === "object" && input.children && input.children.length > 0) {
            result[input.key] = buildNestedValues(input.children, values, key);
          } else if (input.type === "array") {
            const raw = values[key];
            if (raw) {
              try {
                result[input.key] = JSON.parse(raw);
              } catch {
                result[input.key] = raw;
              }
            }
          } else {
            const value = values[key];
            if (value !== undefined && value !== "") {
              result[input.key] = value;
            }
          }
        });
        return result;
      };

      const builtValues = buildNestedValues(inputs, testInputValues);

      if (method === "GET") {
        Object.assign(queryParams, builtValues);
      } else {
        Object.assign(requestBody, builtValues);
      }

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

  const renderInputFields = (
    inputDefs: IActionInput[],
    prefix: string,
    depth: number = 0
  ): React.ReactNode => {
    return inputDefs.map((input) => {
      const fullKey = prefix ? `${prefix}.${input.key}` : input.key;
      const paddingLeft = depth * 16;

      if (input.type === "object" && input.children && input.children.length > 0) {
        return (
          <div key={fullKey} className="space-y-2" style={{ paddingLeft }}>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-medium gap-1">
                {input.key}
                {input.required && <span className="text-red-500">*</span>}
              </Label>
              <span className="text-xs text-muted-foreground">Object</span>
            </div>
            <div className="border-l-2 border-muted pl-3 space-y-3">
              {renderInputFields(input.children, fullKey, depth + 1)}
            </div>
            {input.description && (
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {input.description}
              </p>
            )}
          </div>
        );
      }

      if (input.type === "array") {
        return (
          <div key={fullKey} className="space-y-1" style={{ paddingLeft }}>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm gap-1">
                {input.key}
                {input.required && <span className="text-red-500">*</span>}
              </Label>
              <span className="text-xs text-muted-foreground">Array (JSON)</span>
            </div>
            <Textarea
              value={testInputValues[fullKey] || ""}
              onChange={(e) =>
                setTestInputValues((prev) => ({
                  ...prev,
                  [fullKey]: e.target.value,
                }))
              }
              placeholder={`[{"key": "value"}]`}
              rows={3}
              className="mt-1 font-mono text-xs"
            />
            {input.description && (
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {input.description}
              </p>
            )}
          </div>
        );
      }

      return (
        <div key={fullKey} className="space-y-1" style={{ paddingLeft }}>
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
                checked={testInputValues[fullKey] || false}
                onChange={(e) =>
                  setTestInputValues((prev) => ({
                    ...prev,
                    [fullKey]: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">
                {testInputValues[fullKey] ? "true" : "false"}
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
              value={testInputValues[fullKey] || ""}
              onChange={(e) =>
                setTestInputValues((prev) => ({
                  ...prev,
                  [fullKey]:
                    input.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                }))
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
  };

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
      {inputs.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Test Input Values{" "}
            {method === "GET" ? "(Query Parameters)" : "(Request Body)"}
          </Label>
          <div className="border rounded-md p-4 space-y-3 bg-white">
            {renderInputFields(inputs, "")}
          </div>

          {/* Send Request Button */}
          <div className="">
            <Button
              onClick={handleTestRequest}
              variant={"outline"}
              disabled={
                isTestingRequest ||
                !url ||
                inputs.some(
                  (input) =>
                    input.required &&
                    (!testInputValues[input.key] ||
                      testInputValues[input.key] === "")
                )
              }
              style={{
                background: "#ffffff",
              }}
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
        </div>
      )}

      {testResponse && (
        <div className="border rounded-md p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${testResponse.success ? "bg-green-500" : "bg-red-500"
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
