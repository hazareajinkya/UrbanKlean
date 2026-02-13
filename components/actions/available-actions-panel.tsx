"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Plus, Search, Check } from "lucide-react";
import { IAction } from "@/lib/types/actions";
import { IInstalledApp } from "@/lib/types/app";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import { Loader } from "lucide-react";

interface AvailableActionsPanelProps {
  actions: IAction[] | undefined;
  workspaceActions: IAction[] | undefined;
  installedApps?: IInstalledApp[];
  isLoading?: boolean;
  onAddAction: (action: IAction) => void | Promise<void>;
}

export const AvailableActionsPanel = ({
  actions = [],
  workspaceActions = [],
  installedApps,
  isLoading = false,
  onAddAction,
}: AvailableActionsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingActionId, setAddingActionId] = useState<string | null>(null);

  const handleAddAction = async (action: IAction) => {
    setAddingActionId(action.id);
    try {
      await onAddAction(action);
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setAddingActionId(null);
    }
  };

  const installedActionIds = new Set(
    workspaceActions
      .map((a) => a.originalId)
      .filter((id): id is string => !!id),
  );

  const installedAppIds = new Set(
    (installedApps ?? [])
      .filter((a) => a.status === "connected")
      .map((a) => a.appId),
  );

  const availableActions = actions.filter((action) => {
    if (installedActionIds.has(action.id)) return false;
    if (!action.app?.id) return true;
    return installedAppIds.has(action.app.id);
  });

  const filteredActions = !searchQuery.trim()
    ? availableActions
    : availableActions.filter(
        (action) =>
          action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          action.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          action.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      );

  const isActionAdded = (action: IAction) => {
    return installedActionIds.has(action.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Available Actions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add integration actions to your workspace
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No actions found matching your search"
                : "No integration actions available"}
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const added = isActionAdded(action);
            const IntegrationLogo = action.app?.icon;

            // Determine icon and parent name
            const iconUrl = action.app?.icon;
            const parentName = action.app?.name || "API";

            return (
              <div
                key={action.id}
                className={`relative border rounded-xl bg-card text-card-foreground p-4 transition-all ${
                  added ? "opacity-60 bg-muted/50" : "hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={parentName}
                          className="w-10 h-10 rounded-lg object-cover bg-background border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <span className="font-bold text-xs">API</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-base leading-tight mb-1">
                        {action.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        {parentName}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={added ? "outline" : "default"}
                    onClick={() => handleAddAction(action)}
                    disabled={added || addingActionId === action.id}
                    className={`h-8 px-3 text-xs gap-1.5 ${added ? "bg-background" : ""}`}
                  >
                    {added ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : addingActionId === action.id ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Adding
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </>
                    )}
                  </Button>
                </div>

                {action.description && (
                  <div className="mb-0">
                    <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
