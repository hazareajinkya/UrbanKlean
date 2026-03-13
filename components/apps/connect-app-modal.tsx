"use client";

import { useState, useMemo } from "react";
import { IApp } from "@/lib/types/app";
import { useGlobalActions } from "@/lib/hooks/actions/use-ai-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, X } from "lucide-react";
import Modal from "../ui/modal";
import { motion } from "framer-motion";

interface ConnectAppModalProps {
  app: IApp | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (
    settings: Record<string, any>,
    customRedirectUrl?: string,
  ) => Promise<void>;
  isConnecting?: boolean;
  customRedirectUrl?: string;
}

export default function ConnectAppModal({
  app,
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  customRedirectUrl,
}: ConnectAppModalProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const { globalActions } = useGlobalActions(app?.slug);

  const fields = useMemo(() => {
    if (!app) return [];
    switch (app.authType) {
      case "apiKey":
        return [
          {
            key: "keyValue",
            label:
              app.authConfig.type === "apiKey"
                ? app.authConfig.keyName || "API Key"
                : "API Key",
            type: "password" as const,
            placeholder: "Enter your API key",
            required: true,
          },
        ];
      case "bearerToken":
        return [
          {
            key: "token",
            label: "Bearer Token",
            type: "password" as const,
            placeholder: "Enter your bearer token",
            required: true,
          },
        ];
      case "basic":
        return [
          {
            key: "username",
            label: "Username",
            type: "text" as const,
            placeholder: "Enter username",
            required: true,
          },
          {
            key: "password",
            label: "Password",
            type: "password" as const,
            placeholder: "Enter password",
            required: true,
          },
        ];
      case "custom":
        if (app.authConfig.type === "custom") {
          return Object.keys(app.authConfig.fields).map((fieldKey) => ({
            key: fieldKey,
            label: fieldKey
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase()),
            type:
              fieldKey.toLowerCase().includes("password") ||
              fieldKey.toLowerCase().includes("secret") ||
              fieldKey.toLowerCase().includes("token") ||
              fieldKey.toLowerCase().includes("key")
                ? ("password" as const)
                : ("text" as const),
            placeholder: `Enter ${fieldKey}`,
            required: true,
          }));
        }
        return [];
      case "oauth2":
        return [];
      default:
        return [];
    }
  }, [app]);

  const isFormValid = useMemo(() => {
    return fields
      .filter((f) => f.required)
      .every((f) => formValues[f.key]?.trim());
  }, [fields, formValues]);

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!app) return;
    if (app.authType === "oauth2") {
      await onConnect({}, customRedirectUrl);
      return;
    }
    await onConnect(formValues, customRedirectUrl);
  };

  const handleClose = () => {
    setFormValues({});
    onClose();
  };

  if (!app) return null;

  const isOAuth = app.authType === "oauth2";

  return (
    <>
      <style>
        {`
          @keyframes scan-right {
            from { transform: translateX(-100%); }
            to { transform: translateX(200%); }
          }
          @keyframes scan-left {
            from { transform: translateX(200%); }
            to { transform: translateX(-100%); }
          }
        `}
      </style>
      <Modal
        isOpen={isOpen}
        closeModal={handleClose}
        className="max-w-md rounded-2xl overflow-hidden p-0 bg-gradient-to-t from-gray-200 via-gray-100 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black"
      >
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-50 p-2 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
          {/* Content */}
          <div className="relative pt-10 pb-8">
            {/* Icons Row */}
            <div className="flex items-center justify-center mb-8 mt-2">
              {/* MagicalCX Logo */}
              <div className="w-16 h-16 rounded-lg border bg-card flex items-center justify-center p-0.5 z-10 relative shadow-sm">
                <img
                  src="/logos/magicalcx-appicon-dark.png"
                  alt="MagicalCX"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* Connection Animation */}
              <div className="relative w-16 flex flex-col items-center justify-center gap-3 -mx-2">
                {/* Top line (Right to Left) */}
                <div className="w-full h-[3px] bg-secondary/60 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-l from-transparent via-foreground to-transparent left-0"
                    style={{ animation: "scan-left 1.2s linear infinite" }}
                  />
                </div>

                {/* Bottom line (Left to Right) */}
                <div className="w-full h-[3px] bg-secondary/60 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground to-transparent left-0"
                    style={{ animation: "scan-right 1.2s linear infinite" }}
                  />
                </div>
              </div>

              {/* App Logo */}
              <div className="w-16 h-16 bg-card flex border rounded-lg items-center justify-center p-0.5 z-10 relative shadow-sm">
                {app.logoUrl ? (
                  <img
                    src={app.logoUrl}
                    alt={app.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {app.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl max-w-sm mx-auto font-semibold text-center px-6 mb-2 tracking-normal">
              MagicalCX wants to connect to your {app.name}
            </h2>

            {/* Description */}
            {isOAuth ? (
              <div className="text-center px-6">
                <p className="text-muted-foreground text-sm">
                  Taking you to {app.name}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Please authenticate to continue
                </p>
              </div>
            ) : app.description ? (
              <p className="text-sm text-muted-foreground text-center px-6 max-w-sm mx-auto">
                {app.description}
              </p>
            ) : null}

            {/* Form Fields */}
            {fields.length > 0 && (
              <div className="space-y-4 mt-6 px-6">
                {fields.map((field) => (
                  <div key={field.key} className="flex flex-col">
                    <label
                      htmlFor={field.key}
                      className="text-sm font-medium leading-none mb-2"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.value)
                      }
                      className="bg-background"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 px-6">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isConnecting || (fields.length > 0 && !isFormValid)}
                className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-xl h-12 text-base font-medium"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                ) : (
                  `Connect ${app.name}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
