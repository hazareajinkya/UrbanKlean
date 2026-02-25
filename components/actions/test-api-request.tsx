"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Send, X } from "lucide-react";
import {
  IActionInput,
  IRequestType,
  IActionAuthorization,
} from "@/lib/types/actions";
import axios from "axios";
import { capitalize } from "@/lib/utils";
import { usePublishedApps } from "@/lib/hooks/apps/use-apps";

interface TestApiRequestProps {
  url: string;
  method: IRequestType;
  query: IActionInput[];
  body: IActionInput[];
  headers: Array<{ key: string; value: string }>;
  authorization: IActionAuthorization;
  onClose: () => void;
}

const shouldMaskValue = (key: string) => {
  const normalizedKey = key.toLowerCase();
  return (
    normalizedKey.includes("authorization") ||
    normalizedKey.includes("token") ||
    normalizedKey.includes("secret") ||
    normalizedKey.includes("password") ||
    normalizedKey.includes("api-key") ||
    normalizedKey.includes("apikey")
  );
};

const sanitizeRecord = (record: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (!shouldMaskValue(key)) return [key, value];
      return [key, "***"];
    }),
  );
};

type ResolvedInputValue = {
  value: unknown;
  missingRequiredInputs: string[];
  errors: string[];
};

type StructuredInputType = "object" | "array";

const getInputPath = (args: { parentPath: string; inputKey: string }) => {
  if (!args.parentPath) return args.inputKey;
  return `${args.parentPath}.${args.inputKey}`;
};

const isStructuredInputType = (
  type: IActionInput["type"],
): type is StructuredInputType => {
  return type === "object" || type === "array";
};

type ResolvedAuthorizationResult = {
  authorization: IActionAuthorization;
  error: string | null;
};

const TestApiRequest: React.FC<TestApiRequestProps> = ({
  url,
  method,
  query,
  body,
  headers,
  authorization,
  onClose,
}) => {
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTestingRequest, setIsTestingRequest] = useState(false);
  const [isConnectingParentAuth, setIsConnectingParentAuth] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [parentAuthMessage, setParentAuthMessage] = useState("");
  const [testInputValues, setTestInputValues] = useState<
    Record<string, unknown>
  >({});
  const [runtimeApiKeyValue, setRuntimeApiKeyValue] = useState("");
  const [runtimeBearerToken, setRuntimeBearerToken] = useState("");
  const [runtimeBasicUsername, setRuntimeBasicUsername] = useState("");
  const [runtimeBasicPassword, setRuntimeBasicPassword] = useState("");
  const [objectInputValues, setObjectInputValues] = useState<
    Record<string, string>
  >({});
  const { apps } = usePublishedApps();
  const isParentAuthorization = authorization.type === "parent-auth";
  const parentAppSlug = authorization.parentAuth?.appSlug || "";
  const parentAppAuthType = authorization.parentAuth?.appAuthType;

  const parentApp = useMemo(() => {
    if (!isParentAuthorization || !parentAppSlug || !apps) return null;
    return apps.find((app) => app.slug === parentAppSlug) || null;
  }, [apps, isParentAuthorization, parentAppSlug]);

  const isOAuth2ParentAuth =
    isParentAuthorization && parentAppAuthType === "oauth2";
  const isApiKeyParentAuth =
    isParentAuthorization && parentAppAuthType === "apiKey";
  const isBearerTokenParentAuth =
    isParentAuthorization && parentAppAuthType === "bearerToken";
  const isBasicParentAuth =
    isParentAuthorization && parentAppAuthType === "basic";

  useEffect(() => {
    const storedWorkspaceId =
      typeof window === "undefined"
        ? ""
        : localStorage.getItem("actionsTestWorkspaceId") || "";
    setWorkspaceId(storedWorkspaceId);
  }, []);

  useEffect(() => {
    setRuntimeApiKeyValue("");
    setRuntimeBearerToken("");
    setRuntimeBasicUsername("");
    setRuntimeBasicPassword("");
  }, [authorization.type]);

  const handleWorkspaceIdChange = (value: string) => {
    setWorkspaceId(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("actionsTestWorkspaceId", value);
    }
  };

  const handleConnectParentAuth = async () => {
    if (!isParentAuthorization) return;
    if (!parentAppSlug) {
      setParentAuthMessage("Parent app slug is missing for this action.");
      return;
    }

    const trimmedWorkspaceId = workspaceId.trim();
    if (!trimmedWorkspaceId) {
      setParentAuthMessage("Workspace ID is required to connect app auth.");
      return;
    }

    if (authorization.parentAuth?.appAuthType !== "oauth2") {
      setParentAuthMessage(
        "Connect flow for parent auth is currently supported for OAuth2 apps only.",
      );
      return;
    }

    setIsConnectingParentAuth(true);
    setParentAuthMessage("");

    try {
      const response = await axios.post(`/api/apps/${parentAppSlug}/connect`, {
        workspaceId: trimmedWorkspaceId,
        callbackRedirectUrl: window.location.href,
      });

      const data = response.data?.data;
      if (data?.mode === "oauth2" && data.authorizationUrl) {
        window.open(data.authorizationUrl, "_blank", "noopener,noreferrer");
        setParentAuthMessage(
          "Opened OAuth connect page in a new tab. Complete auth, then return and run test.",
        );
        return;
      }

      setParentAuthMessage(data?.message || "Connect request completed.");
    } catch (error: any) {
      setParentAuthMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start connect flow.",
      );
    } finally {
      setIsConnectingParentAuth(false);
    }
  };

  const getParsedStructuredInputValue = (args: {
    inputType: StructuredInputType;
    inputPath: string;
    inputLabel: string;
  }) => {
    const rawValue = objectInputValues[args.inputPath]?.trim() || "";
    if (!rawValue) return { value: undefined, error: null };

    try {
      const parsedValue = JSON.parse(rawValue);
      const isObjectValue =
        parsedValue !== null &&
        typeof parsedValue === "object" &&
        !Array.isArray(parsedValue);
      const isArrayValue = Array.isArray(parsedValue);
      const isValidType =
        args.inputType === "object" ? isObjectValue : isArrayValue;

      if (!isValidType) {
        return {
          value: undefined,
          error: `Field "${args.inputLabel}" must be a valid JSON ${args.inputType}`,
        };
      }

      return { value: parsedValue, error: null };
    } catch {
      return {
        value: undefined,
        error: `Field "${args.inputLabel}" contains invalid JSON`,
      };
    }
  };

  const resolveInputValue = (args: {
    input: IActionInput;
    inputPath: string;
  }): ResolvedInputValue => {
    if (isStructuredInputType(args.input.type)) {
      if ((args.input.children || []).length > 0) {
        const resolvedObjectValue: Record<string, unknown> = {};
        const missingRequiredInputs: string[] = [];
        const errors: string[] = [];

        (args.input.children || []).forEach((childInput) => {
          if (!childInput.key.trim()) return;
          const childPath = getInputPath({
            parentPath: args.inputPath,
            inputKey: childInput.key,
          });
          const childResult = resolveInputValue({
            input: childInput,
            inputPath: childPath,
          });

          missingRequiredInputs.push(...childResult.missingRequiredInputs);
          errors.push(...childResult.errors);

          if (childResult.value !== undefined) {
            resolvedObjectValue[childInput.key] = childResult.value;
          }
        });

        const hasObjectValue = Object.keys(resolvedObjectValue).length > 0;
        const hasRequiredChildren = (args.input.children || []).some(
          (childInput) => childInput.required,
        );

        if (!hasObjectValue && !args.input.required) {
          return {
            value: undefined,
            missingRequiredInputs: [],
            errors: [],
          };
        }

        if (args.input.required && !hasObjectValue && !hasRequiredChildren) {
          missingRequiredInputs.push(args.inputPath);
        }

        return {
          value: hasObjectValue
            ? args.input.type === "array"
              ? [resolvedObjectValue]
              : resolvedObjectValue
            : undefined,
          missingRequiredInputs,
          errors,
        };
      }

      const parsedObjectResult = getParsedStructuredInputValue({
        inputType: args.input.type,
        inputPath: args.inputPath,
        inputLabel: args.inputPath,
      });

      if (parsedObjectResult.error) {
        return {
          value: undefined,
          missingRequiredInputs: [],
          errors: [parsedObjectResult.error],
        };
      }

      if (args.input.required && parsedObjectResult.value === undefined) {
        return {
          value: undefined,
          missingRequiredInputs: [args.inputPath],
          errors: [],
        };
      }

      return {
        value: parsedObjectResult.value,
        missingRequiredInputs: [],
        errors: [],
      };
    }

    if (args.input.type === "boolean") {
      const booleanValue = testInputValues[args.inputPath];
      if (booleanValue === undefined) {
        return {
          value: undefined,
          missingRequiredInputs: args.input.required ? [args.inputPath] : [],
          errors: [],
        };
      }

      return {
        value: Boolean(booleanValue),
        missingRequiredInputs: [],
        errors: [],
      };
    }

    if (args.input.type === "number") {
      const numberRawValue = testInputValues[args.inputPath];
      const isMissingValue =
        numberRawValue === undefined ||
        numberRawValue === null ||
        numberRawValue === "";

      if (isMissingValue) {
        return {
          value: undefined,
          missingRequiredInputs: args.input.required ? [args.inputPath] : [],
          errors: [],
        };
      }

      const parsedNumber = Number(numberRawValue);
      if (Number.isNaN(parsedNumber)) {
        return {
          value: undefined,
          missingRequiredInputs: [],
          errors: [`Field "${args.inputPath}" must be a valid number`],
        };
      }

      return {
        value: parsedNumber,
        missingRequiredInputs: [],
        errors: [],
      };
    }

    const inputValue = testInputValues[args.inputPath];
    const isMissingValue = inputValue === undefined || inputValue === "";
    if (isMissingValue) {
      return {
        value: undefined,
        missingRequiredInputs: args.input.required ? [args.inputPath] : [],
        errors: [],
      };
    }

    return {
      value: String(inputValue),
      missingRequiredInputs: [],
      errors: [],
    };
  };

  const resolveInputList = (inputList: IActionInput[], prefix?: string) => {
    const values: Record<string, unknown> = {};
    const missingRequiredInputs: string[] = [];
    const errors: string[] = [];

    inputList.forEach((input) => {
      if (!input.key.trim()) return;
      const inputPath = prefix
        ? getInputPath({ parentPath: prefix, inputKey: input.key })
        : input.key;
      const inputResult = resolveInputValue({
        input,
        inputPath,
      });
      missingRequiredInputs.push(...inputResult.missingRequiredInputs);
      errors.push(...inputResult.errors);
      if (inputResult.value !== undefined) {
        values[input.key] = inputResult.value;
      }
    });

    return {
      values,
      missingRequiredInputs: Array.from(new Set(missingRequiredInputs)),
      errors: Array.from(new Set(errors)),
    };
  };

  const getResolvedAuthorization = (): ResolvedAuthorizationResult => {
    if (authorization.type === "api-key" || isApiKeyParentAuth) {
      const keyFromConfig =
        parentApp?.authConfig?.type === "apiKey"
          ? parentApp.authConfig.keyName
          : authorization.apiKey?.key?.trim() || "";
      const key = keyFromConfig || "";
      const value = runtimeApiKeyValue.trim();
      const locationFromConfig =
        parentApp?.authConfig?.type === "apiKey"
          ? parentApp.authConfig.in
          : authorization.apiKey?.location || "header";
      const location = locationFromConfig || "header";
      const prefix =
        parentApp?.authConfig?.type === "apiKey"
          ? (parentApp.authConfig.valuePrefix ?? "")
          : "";

      if (!key) {
        return {
          authorization,
          error: "API key name is required in authorization settings.",
        };
      }

      if (!value) {
        return {
          authorization,
          error: "API key value is required to send this request.",
        };
      }

      return {
        authorization: {
          ...authorization,
          type: "api-key",
          apiKey: {
            key,
            value,
            location,
          },
        },
        error: null,
      };
    }

    if (authorization.type === "bearer-token" || isBearerTokenParentAuth) {
      const token = runtimeBearerToken.trim();
      if (!token) {
        return {
          authorization,
          error: "Bearer token is required to send this request.",
        };
      }

      return {
        authorization: {
          ...authorization,
          type: "bearer-token",
          bearerToken: {
            token,
          },
        },
        error: null,
      };
    }

    if (authorization.type === "basic" || isBasicParentAuth) {
      const username = runtimeBasicUsername.trim();
      const password = runtimeBasicPassword.trim();

      if (!username || !password) {
        return {
          authorization,
          error:
            "Basic auth username and password are required to send this request.",
        };
      }

      return {
        authorization: {
          ...authorization,
          type: "basic",
          basic: {
            username,
            password,
          },
        },
        error: null,
      };
    }

    return {
      authorization,
      error: null,
    };
  };

  const handleTestRequest = async () => {
    if (!url) {
      setTestResponse({
        error: "URL is required to test the request",
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const queryResult = resolveInputList(query, "query");
    const bodyResult = resolveInputList(body, "body");

    const allErrors = [...queryResult.errors, ...bodyResult.errors];
    if (allErrors.length > 0) {
      setTestResponse({
        error: allErrors.join(", "),
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const allMissing = [
      ...queryResult.missingRequiredInputs,
      ...bodyResult.missingRequiredInputs,
    ];
    if (allMissing.length > 0) {
      setTestResponse({
        error: `Required inputs missing: ${allMissing.join(", ")}`,
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const resolvedAuthorizationResult = getResolvedAuthorization();
    if (resolvedAuthorizationResult.error) {
      setTestResponse({
        error: resolvedAuthorizationResult.error,
        status: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setIsTestingRequest(true);
    setTestResponse(null);
    const startTime = Date.now();

    try {
      if (isOAuth2ParentAuth && !workspaceId.trim()) {
        setTestResponse({
          success: false,
          error:
            "Workspace ID is required for OAuth2 parent-auth action tests.",
          status: 0,
          statusText: "Missing workspace ID",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Prepare query parameters and request body
      const queryParams: Record<string, unknown> = queryResult.values;
      const requestBody: Record<string, unknown> = bodyResult.values;

      const payload = {
        url,
        method,
        headers: requestHeaders,
        params: queryParams,
        body: requestBody,
        workspaceId: workspaceId.trim() || undefined,
        authorization: resolvedAuthorizationResult.authorization,
        timeoutMs: 10000,
      };

      console.log("[TestApiRequest] sending request", {
        mode: "server-proxy",
        method: payload.method,
        url: payload.url,
        headers: sanitizeRecord(payload.headers || {}),
        params: sanitizeRecord(payload.params || {}),
        hasBody: Object.keys(payload.body || {}).length > 0,
        authorizationType: payload.authorization.type,
        workspaceId: payload.workspaceId || null,
        timeout: payload.timeoutMs,
      });

      const response = await axios.post("/api/actions/test", payload);
      const endTime = Date.now();
      const proxyData = response.data?.data;

      if (!proxyData) {
        throw new Error("Invalid test proxy response");
      }

      setTestResponse({
        success: proxyData.success,
        status: proxyData.status,
        statusText: proxyData.statusText,
        headers: proxyData.headers || {},
        data: proxyData.data,
        responseTime: proxyData.responseTime || endTime - startTime,
        timestamp: proxyData.timestamp || new Date().toISOString(),
      });
    } catch (error: any) {
      const endTime = Date.now();

      setTestResponse({
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Network Error",
        headers: error.response?.headers || {},
        data: error.response?.data?.data || null,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingRequest(false);
    }
  };

  const renderInputField = (args: {
    input: IActionInput;
    inputPath: string;
    depth: number;
  }) => {
    const hasNestedChildren =
      isStructuredInputType(args.input.type) &&
      (args.input.children || []).length > 0;

    return (
      <div
        key={args.inputPath}
        className={`space-y-2 ${args.depth > 0 ? "ml-4 border-l border-border pl-3" : ""}`}
      >
        <div className="space-y-1">
          <div className="mb-1.5 flex items-center justify-between space-x-2">
            <Label className="gap-1 text-sm">
              {args.input.key}
              {args.input.required ? (
                <span className="text-red-500">*</span>
              ) : null}
            </Label>
            <span className="text-right text-xs text-muted-foreground">
              {capitalize(args.input.type)}
            </span>
          </div>

          {args.input.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Boolean(testInputValues[args.inputPath])}
                onChange={(event) =>
                  setTestInputValues((prev) => ({
                    ...prev,
                    [args.inputPath]: event.target.checked,
                  }))
                }
                className="rounded border-border bg-background accent-primary"
              />
              <span className="text-sm">
                {Boolean(testInputValues[args.inputPath]) ? "true" : "false"}
              </span>
            </div>
          ) : null}

          {isStructuredInputType(args.input.type) && !hasNestedChildren ? (
            <Textarea
              value={objectInputValues[args.inputPath] || ""}
              onChange={(event) =>
                setObjectInputValues((prev) => ({
                  ...prev,
                  [args.inputPath]: event.target.value,
                }))
              }
              placeholder={
                args.input.type === "array"
                  ? '[{"field":"value"}]'
                  : '{"nested":{"field":"value"}}'
              }
              className="mt-1 min-h-24 font-mono text-xs"
            />
          ) : null}

          {args.input.type !== "boolean" &&
          !isStructuredInputType(args.input.type) ? (
            <Input
              type={
                args.input.type === "number"
                  ? "number"
                  : args.input.type === "url"
                    ? "url"
                    : "text"
              }
              value={
                args.input.type === "number" ||
                args.input.type === "url" ||
                args.input.type === "string"
                  ? String(testInputValues[args.inputPath] ?? "")
                  : ""
              }
              onChange={(event) =>
                setTestInputValues((prev) => ({
                  ...prev,
                  [args.inputPath]: event.target.value,
                }))
              }
              placeholder={`Enter ${args.input.key}...`}
              className="mt-1"
            />
          ) : null}

          {args.input.description ? (
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {args.input.description}
            </p>
          ) : null}
        </div>

        {hasNestedChildren ? (
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowRight className="size-3" />
              Nested variables for{" "}
              <span className="font-medium text-foreground">
                {args.input.key}
              </span>
            </p>
            <div className="space-y-3">
              {(args.input.children || [])
                .filter((childInput) => childInput.key.trim() !== "")
                .map((childInput) =>
                  renderInputField({
                    input: childInput,
                    inputPath: getInputPath({
                      parentPath: args.inputPath,
                      inputKey: childInput.key,
                    }),
                    depth: args.depth + 1,
                  }),
                )}
            </div>
          </div>
        ) : null}
      </div>
    );
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

      {/* Resolved URL preview */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Resolved URL</Label>
        <div className="rounded-md border border-border bg-muted/40 p-2 break-all">
          <code className="text-xs text-foreground">
            {(() => {
              let resolvedUrl = url;
              const templateVarRegex = /\{([\w-]+)\}/g;
              resolvedUrl = resolvedUrl.replace(
                templateVarRegex,
                (fullMatch, key) => {
                  const prefixedKey = `query.${key}`;
                  const value = testInputValues[prefixedKey];
                  if (value !== undefined && value !== null && value !== "") {
                    return String(value);
                  }
                  return fullMatch;
                },
              );
              return resolvedUrl;
            })()}
          </code>
        </div>
      </div>

      <div className="space-y-3">
        {isOAuth2ParentAuth ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label htmlFor="workspaceId" className="text-sm font-medium">
              Workspace ID (for parent auth)
            </Label>
            <Input
              id="workspaceId"
              value={workspaceId}
              onChange={(event) => handleWorkspaceIdChange(event.target.value)}
              placeholder="workspace-id"
              className="mt-1"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConnectParentAuth}
              disabled={isConnectingParentAuth || !workspaceId.trim()}
            >
              {isConnectingParentAuth ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Connect Parent App
            </Button>
            {parentAuthMessage ? (
              <p className="text-xs text-muted-foreground">
                {parentAuthMessage}
              </p>
            ) : null}
          </div>
        ) : null}

        {isApiKeyParentAuth ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label htmlFor="runtimeApiKeyValue" className="text-sm font-medium">
              API Key Value
              {parentApp?.authConfig?.type === "apiKey" ? (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({parentApp.authConfig.keyName})
                </span>
              ) : null}
            </Label>
            <Input
              id="runtimeApiKeyValue"
              type="password"
              value={runtimeApiKeyValue}
              onChange={(event) => setRuntimeApiKeyValue(event.target.value)}
              placeholder="Enter API key value"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground">
              Sends as{" "}
              <span className="font-medium text-foreground">
                {parentApp?.authConfig?.type === "apiKey"
                  ? parentApp.authConfig.in
                  : "header"}
              </span>{" "}
              using key{" "}
              <span className="font-medium text-foreground">
                {parentApp?.authConfig?.type === "apiKey"
                  ? parentApp.authConfig.keyName
                  : "(unknown)"}
              </span>
              .
            </p>
          </div>
        ) : null}

        {isBearerTokenParentAuth ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label htmlFor="runtimeBearerToken" className="text-sm font-medium">
              Bearer Token
            </Label>
            <Input
              id="runtimeBearerToken"
              type="password"
              value={runtimeBearerToken}
              onChange={(event) => setRuntimeBearerToken(event.target.value)}
              placeholder="Enter bearer token"
              className="mt-1"
            />
          </div>
        ) : null}

        {isBasicParentAuth ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label
              htmlFor="runtimeBasicUsername"
              className="text-sm font-medium"
            >
              Basic Auth Username
            </Label>
            <Input
              id="runtimeBasicUsername"
              value={runtimeBasicUsername}
              onChange={(event) => setRuntimeBasicUsername(event.target.value)}
              placeholder="Enter username"
              className="mt-1"
            />
            <Label
              htmlFor="runtimeBasicPassword"
              className="text-sm font-medium"
            >
              Basic Auth Password
            </Label>
            <Input
              id="runtimeBasicPassword"
              type="password"
              value={runtimeBasicPassword}
              onChange={(event) => setRuntimeBasicPassword(event.target.value)}
              placeholder="Enter password"
              className="mt-1"
            />
          </div>
        ) : null}

        {authorization.type === "api-key" ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label htmlFor="runtimeApiKeyValue" className="text-sm font-medium">
              API Key Value
            </Label>
            <Input
              id="runtimeApiKeyValue"
              type="password"
              value={runtimeApiKeyValue}
              onChange={(event) => setRuntimeApiKeyValue(event.target.value)}
              placeholder="Enter API key value"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground">
              Sends as{" "}
              <span className="font-medium text-foreground">
                {authorization.apiKey?.location || "header"}
              </span>{" "}
              using key{" "}
              <span className="font-medium text-foreground">
                {authorization.apiKey?.key || "(missing key name)"}
              </span>
              .
            </p>
          </div>
        ) : null}

        {authorization.type === "bearer-token" ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label htmlFor="runtimeBearerToken" className="text-sm font-medium">
              Bearer Token
            </Label>
            <Input
              id="runtimeBearerToken"
              type="password"
              value={runtimeBearerToken}
              onChange={(event) => setRuntimeBearerToken(event.target.value)}
              placeholder="Enter bearer token"
              className="mt-1"
            />
          </div>
        ) : null}

        {authorization.type === "basic" ? (
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <Label
              htmlFor="runtimeBasicUsername"
              className="text-sm font-medium"
            >
              Basic Auth Username
            </Label>
            <Input
              id="runtimeBasicUsername"
              value={runtimeBasicUsername}
              onChange={(event) => setRuntimeBasicUsername(event.target.value)}
              placeholder="Enter username"
              className="mt-1"
            />
            <Label
              htmlFor="runtimeBasicPassword"
              className="text-sm font-medium"
            >
              Basic Auth Password
            </Label>
            <Input
              id="runtimeBasicPassword"
              type="password"
              value={runtimeBasicPassword}
              onChange={(event) => setRuntimeBasicPassword(event.target.value)}
              placeholder="Enter password"
              className="mt-1"
            />
          </div>
        ) : null}

        {query.length > 0 ? (
          <>
            <Label className="text-sm font-medium">Query Parameters</Label>
            <div className="space-y-3 rounded-md border border-border bg-card p-4">
              {query
                .filter((input) => input.key.trim() !== "")
                .map((input) =>
                  renderInputField({
                    input,
                    inputPath: `query.${input.key}`,
                    depth: 0,
                  }),
                )}
            </div>
          </>
        ) : null}

        {method !== "GET" && body.length > 0 ? (
          <>
            <Label className="text-sm font-medium">Request Body</Label>
            <div className="space-y-3 rounded-md border border-border bg-card p-4">
              {body
                .filter((input) => input.key.trim() !== "")
                .map((input) =>
                  renderInputField({
                    input,
                    inputPath: `body.${input.key}`,
                    depth: 0,
                  }),
                )}
            </div>
          </>
        ) : null}

        {query.length === 0 && (method === "GET" || body.length === 0) ? (
          <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
            No input parameters required for this endpoint.
          </div>
        ) : null}

        <div>
          <Button
            onClick={handleTestRequest}
            variant={"outline"}
            disabled={isTestingRequest || !url}
            className="w-full gap-2"
          >
            {isTestingRequest ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isTestingRequest ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </div>

      {testResponse && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
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
                <span className="text-xs text-muted-foreground">
                  ({testResponse.responseTime}ms)
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(testResponse.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {testResponse.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{testResponse.error}</p>
            </div>
          )}

          {testResponse.data && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Response</Label>
              <div className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-3">
                <pre className="whitespace-pre-wrap text-xs text-foreground">
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
                <div className="max-h-32 overflow-auto rounded-md border border-border bg-muted/40 p-3">
                  <pre className="text-xs text-foreground">
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
