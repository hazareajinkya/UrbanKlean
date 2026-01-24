"use client";

import { Switch } from "@/components/ui/switch";
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
    <div className="relative border rounded-xl bg-card text-card-foreground p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {IntegrationLogo ? (
              <IntegrationLogo className="w-10 h-10" />
            ) : (
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">API</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight mb-0.5">
              {action.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {action.integration !== "none" ? action.integration : "API"}
            </p>
          </div>
        </div>
        <Switch
          checked={action.status === "active"}
          onCheckedChange={handleToggle}
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {action.description}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        {isUserAction && onEdit && (
          <button
            onClick={() => onEdit(action)}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-xs transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(action)}
            className="text-red-500 hover:text-red-600 font-medium text-xs transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
