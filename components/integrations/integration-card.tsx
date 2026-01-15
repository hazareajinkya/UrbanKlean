import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IIntegration } from "@/lib/types/integration";
import { cn } from "@/lib/utils";
import { Settings, Check } from "lucide-react";

interface IntegrationCardProps {
  integration: IIntegration;
  onOpenDetail: (integration: IIntegration) => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconBgClassName?: string;
  iconClassName?: string;
}

const IntegrationCard = ({
  integration,
  onOpenDetail,
  icon,
  title,
  subtitle,
  iconBgClassName = "",
  iconClassName = "",
}: IntegrationCardProps) => {
  const iconElement = React.isValidElement(icon) ? (
    React.cloneElement(icon as React.ReactElement<any>, {
      className: cn("w-8 h-8", iconClassName, (icon as any).props?.className),
    })
  ) : (
    <div className={cn("w-8 h-8", iconClassName)}>{icon}</div>
  );

  const isActive = integration.status === "active";

  const handleCardClick = () => {
    onOpenDetail(integration);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg shrink-0 flex items-center justify-center bg-muted/60 border transition-colors group-hover:bg-muted",
              iconBgClassName
            )}
          >
            {iconElement}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{title}</h3>
              {isActive && (
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-medium px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                >
                  <Check className="w-2.5 h-2.5 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {subtitle || integration.metadata?.storeId || integration.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
