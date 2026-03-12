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
  const IntegrationLogo = action.app?.icon;

  // Determine icon and parent name
  const iconUrl = action.app?.icon;
  const parentName = action.app?.name || "API";

  const handleToggle = (checked: boolean) => {
    onToggleStatus(action.id, checked ? "active" : "inactive");
  };

  return (
    <div className="relative border rounded-xl bg-card text-card-foreground p-4  transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border p-0.5">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={parentName}
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <span className="text-xs font-bold text-primary">API</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-base leading-tight mb-0.5">
              {action.name}
            </h3>
            <p className="text-xs text-muted-foreground ">{parentName}</p>
          </div>
        </div>
        <Switch
          checked={action.status === "active"}
          className="mt-2"
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
            className="text-primary hover:text-primary/80 font-medium text-xs transition-colors"
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
