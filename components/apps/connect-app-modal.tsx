"use client";

import { useState, useMemo } from "react";
import { IApp } from "@/lib/types/app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, ExternalLink } from "lucide-react";

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

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = useMemo(() => {
    return fields
      .filter((f) => f.required)
      .every((f) => formValues[f.key]?.trim());
  }, [fields, formValues]);

  const handleSubmit = async () => {
    if (!app) return;

    if (app.authType === "oauth2") {
      await onConnect({});
      return;
    }

    await onConnect(formValues);
    setFormValues({});
  };

  const handleClose = () => {
    setFormValues({});
    onClose();
  };

  if (!app) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {app.logoUrl && (
              <img
                src={app.logoUrl}
                alt={app.name}
                className="w-8 h-8 rounded-lg"
              />
            )}
            <div>
              <DialogTitle>Connect {app.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {app.authType === "oauth2"
                  ? `Click below to connect your ${app.name} account.`
                  : `Enter your credentials to connect ${app.name}.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Auth fields */}
        {fields.length > 0 && (
          <div className="space-y-4 py-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label
                  htmlFor={field.key}
                  className="text-sm font-medium leading-none"
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
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="bg-background"
                />
              </div>
            ))}
          </div>
        )}

        {app.authType === "oauth2" && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              You will be redirected to {app.name} to authorize access.
            </p>
          </div>
        )}

        {app.documentationUrl && (
          <a
            href={app.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View documentation
          </a>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isConnecting || (fields.length > 0 && !isFormValid)}
          >
            {isConnecting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : app.authType === "oauth2" ? (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect with {app.name}
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
