"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Plus, Search, Check } from "lucide-react";
import { IAction } from "@/lib/types/actions";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import { Loader } from "lucide-react";

interface AvailableActionsPanelProps {
  actions: IAction[] | undefined;
  workspaceActions: IAction[] | undefined;
  isLoading?: boolean;
  onAddAction: (action: IAction) => void | Promise<void>;
}

export const AvailableActionsPanel = ({
  actions = [],
  workspaceActions = [],
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

  const workspaceActionKeys = new Set(
    workspaceActions
      .filter((a) => a.type === "integration")
      .map((a) => `${a.slug}_${a.integration}`),
  );

  const filteredActions = !searchQuery.trim()
    ? actions
    : actions.filter(
        (action) =>
          action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          action.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          action.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      );

  const isActionAdded = (action: IAction) => {
    const key = `${action.slug}_${action.integration}`;
    return workspaceActionKeys.has(key);
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
            const integrationConfig =
              action.integration !== "none"
                ? getIntegrationConfig(action.integration)
                : null;
            const IntegrationLogo = integrationConfig?.logo;

            return (
              <div
                key={action.id}
                className={`border rounded-md p-3 transition-all ${
                  added ? "opacity-60 bg-muted" : "hover:border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {IntegrationLogo ? (
                      <IntegrationLogo className="w-5 h-5" />
                    ) : (
                      <img
                        src="/api-logo.png"
                        alt="API Logo"
                        className="w-5 h-5 rounded-sm object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.name}</p>
                        {action.integration !== "none" && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm inline-block mt-1">
                            {action.integration}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={added ? "ghost" : "ghost"}
                        onClick={() => handleAddAction(action)}
                        disabled={added || addingActionId === action.id}
                        className="h-7 px-2 text-xs gap-1.5"
                      >
                        {added ? (
                          <>
                            <Check className="w-3 h-3" />
                            Added
                          </>
                        ) : addingActionId === action.id ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Adding
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
