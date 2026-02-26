"use client";

import { useState, useMemo } from "react";
import { IApp } from "@/lib/types/app";
import { useGlobalActions } from "@/lib/hooks/actions/use-ai-actions";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader,
  ExternalLink,
  ArrowLeftRight,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import Modal from "../ui/modal";

interface ConnectAppModalProps {
  app: IApp | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (settings: Record<string, any>) => Promise<void>;
  isConnecting?: boolean;
}

export default function ConnectAppModal({
  app,
  isOpen,
  onClose,
  onConnect,
  isConnecting,
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
      await onConnect({});
      return;
    }
    await onConnect(formValues);
  };

  const handleClose = () => {
    setFormValues({});
    onClose();
  };

  if (!app) return null;

  const isOAuth = app.authType === "oauth2";

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      className="max-w-sm bg-card rounded-2xl pb-4 pt-6"
    >
      <div className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border bg-background flex items-center justify-center shadow-sm p-2">
              <img
                src="/logos/magicalcx-icon-trans-dark.png"
                alt="MagicalCX"
                className="w-10 h-10 object-contain "
              />
            </div>

            <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
            <div className="w-12 h-12 rounded-xl overflow-hidden border bg-background flex items-center justify-center shadow-sm">
              {app.logoUrl ? (
                <img
                  src={app.logoUrl}
                  alt={app.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="text-lg font-medium text-muted-foreground">
                  {app.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <h2 className="text-lg font-medium text-center">
            Connect to {app.name}
          </h2>
          {app.description && (
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {app.description}
            </p>
          )}
        </div>

        <div className="space-y-5 my-4 px-4">
          {fields.length > 0 && (
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col ">
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

          {isOAuth && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to {app.name} to authorize access.
            </p>
          )}
        </div>

        <div className="flex flex-row items-center gap-2 sm:justify-between w-full border-t border-border pt-4 px-4">
          <div>
            {/* {app.documentationUrl && (
              <a href={app.documentationUrl} target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  How it works
                </Button>
              </a>
            )} */}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isConnecting || (fields.length > 0 && !isFormValid)}
            >
              {isConnecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Connecting
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
