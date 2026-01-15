import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvalibleIntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isConnected?: boolean;
  onConnect: () => void;
  iconBgClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export default function AvalibleIntegrationCard({
  icon,
  title,
  description,
  isConnected = false,
  onConnect,
  iconBgClassName = "",
  iconClassName = "",
  disabled = false,
}: AvalibleIntegrationCardProps) {
  const iconElement = React.isValidElement(icon) ? (
    React.cloneElement(icon as React.ReactElement<any>, {
      className: cn("w-8 h-8", iconClassName, (icon as any).props?.className),
    })
  ) : (
    <div className={cn("w-6 h-6", iconClassName)}>{icon}</div>
  );

  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-2 rounded-lg shrink-0 flex items-center justify-center",
              iconBgClassName
            )}
          >
            {iconElement}
          </div>
          <div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onConnect}
          className="w-full"
          variant="outline"
          disabled={disabled || isConnected}
        >
          {isConnected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Connected
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Connect
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
