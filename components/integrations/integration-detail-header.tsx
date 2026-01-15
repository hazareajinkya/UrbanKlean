import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationConfig } from "@/lib/data/integration-configs";
import { IIntegration } from "@/lib/types/integration";
import { Wrench, Zap, Copy, ExternalLink, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface IntegrationDetailHeaderProps {
  config: IntegrationConfig;
  integration: IIntegration | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const IntegrationDetailHeader = ({
  config,
  integration,
  isConnecting,
  isDisconnecting,
  onConnect,
  onDisconnect,
}: IntegrationDetailHeaderProps) => {
  const Logo = config.logo;
  const isConnected = integration?.status === "active";
  const authTypes = Array.isArray(config.authType)
    ? config.authType
    : [config.authType];

  const handleCopyName = () => {
    navigator.clipboard.writeText(config.slug.toUpperCase());
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted/60 border">
            <Logo className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">{config.name}</h1>
              <button
                onClick={handleCopyName}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy integration name"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground uppercase mt-0.5">
              {config.slug.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View Documentation
          </Button>
          {isConnected ? (
            <Button
              variant="default"
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="gap-2"
            >
              {isDisconnecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={onConnect}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{config.description}</p>

      <div className="flex flex-wrap items-center gap-4">
        {authTypes.map((authType) => (
          <Badge
            key={authType}
            variant="outline"
            className={cn(
              "text-xs font-medium px-2 py-1",
              authType === "oauth2"
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800"
            )}
          >
            {authType === "oauth2" ? "OAUTH2" : "API_KEY"}
          </Badge>
        ))}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wrench className="w-4 h-4" />
          <span>{config.tools.length} Tools</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Categories: {config.categories.join(", ")}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetailHeader;
