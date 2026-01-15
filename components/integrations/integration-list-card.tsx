import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationConfig } from "@/lib/data/integration-configs";
import { Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationListCardProps {
  config: IntegrationConfig;
  isConnected?: boolean;
  onClick: () => void;
}

const IntegrationListCard = ({
  config,
  isConnected = false,
  onClick,
}: IntegrationListCardProps) => {
  const Logo = config.logo;
  const authTypes = Array.isArray(config.authType)
    ? config.authType
    : [config.authType];

  const handleClick = () => {
    if (!isConnected) {
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "group transition-all duration-200",
        isConnected
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:shadow-md hover:border-primary/20"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted/60 border shrink-0 flex items-center justify-center w-12 h-12">
              <Logo className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base mb-0.5">{config.name}</h3>
              <p className="text-xs text-muted-foreground uppercase">
                {config.slug.toUpperCase()}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {config.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {authTypes.map((authType) => (
              <Badge
                key={authType}
                variant="outline"
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5",
                  authType === "oauth2"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                    : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800"
                )}
              >
                {authType === "oauth2" ? "OAUTH2" : "API_KEY"}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="w-3.5 h-3.5" />
              <span>{config.tools.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationListCard;
