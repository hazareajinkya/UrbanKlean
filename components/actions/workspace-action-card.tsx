"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { IAction } from "@/lib/types/actions";
import { getIntegrationConfig } from "@/lib/data/integration-configs";

interface WorkspaceActionCardProps {
  action: IAction;
  onToggleStatus: (actionId: string, status: "active" | "inactive") => void;
  onEdit?: (action: IAction) => void;
  onDelete?: (action: IAction) => void;
}

export const WorkspaceActionCard = ({
  action,
  onToggleStatus,
  onEdit,
  onDelete,
}: WorkspaceActionCardProps) => {
  const isUserAction = action.type === "user";
  const integrationConfig =
    action.integration !== "none"
      ? getIntegrationConfig(action.integration)
      : null;
  const IntegrationLogo = integrationConfig?.logo;

  const handleToggle = (checked: boolean) => {
    onToggleStatus(action.id, checked ? "active" : "inactive");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="space-y-0 pt-6">
        <div className="mb-4 flex gap-2 items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">{action.name}</p>
              {action.integration !== "none" && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                  {action.integration}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            {IntegrationLogo ? (
              <IntegrationLogo className="w-8 h-8" />
            ) : (
              <img
                src="/api-logo.png"
                alt="API Logo"
                className="w-8 h-8 rounded-sm object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Status</span>
            <Switch
              checked={action.status === "active"}
              onCheckedChange={handleToggle}
            />
            <span className="text-xs text-muted-foreground">
              {action.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isUserAction && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(action)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(action)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
