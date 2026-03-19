"use client";

import { Switch } from "@/components/ui/switch";
import { IAction } from "@/lib/types/actions";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreVertical } from "lucide-react";

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
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
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
          <div className="flex-1 min-w-0">
            <h3 className="text-base leading-tight mb-1 truncate">
              {action.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {parentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 -mt-1 -mr-1">
          <Switch
            checked={action.status === "active"}
            onCheckedChange={handleToggle}
            aria-label="Toggle action status"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Action Options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isUserAction && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(action)} className="cursor-pointer">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Action
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(action)}
                  className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2 leading-none" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {action.description}
        </p>
      </div>
    </div>
  );
};
