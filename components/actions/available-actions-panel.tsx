"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Check } from "lucide-react";
import { IAction } from "@/lib/types/actions";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import { Loader } from "lucide-react";

interface AvailableActionsPanelProps {
  actions: IAction[] | undefined;
  workspaceActions: IAction[] | undefined;
  isLoading?: boolean;
  onAddAction: (action: IAction) => void;
}

export const AvailableActionsPanel = ({
  actions = [],
  workspaceActions = [],
  isLoading = false,
  onAddAction,
}: AvailableActionsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Create a set of unique identifiers for workspace actions (slug + integration)
  // Since we generate new IDs when copying, we compare by slug + integration
  // Only check integration type actions since that's what we're adding
  const workspaceActionKeys = useMemo(() => {
    return new Set(
      workspaceActions
        .filter((a) => a.type === "integration")
        .map((a) => `${a.slug}_${a.integration}`)
    );
  }, [workspaceActions]);

  // Filter actions by search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return actions;

    const query = searchQuery.toLowerCase();
    return actions.filter(
      (action) =>
        action.name.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.slug.toLowerCase().includes(query)
    );
  }, [actions, searchQuery]);

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
          Browse and add integration actions to your workspace
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
              <Card
                key={action.id}
                className={`transition-all ${
                  added
                    ? "opacity-60 bg-muted"
                    : "hover:shadow-md hover:border-primary/50"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {IntegrationLogo ? (
                        <IntegrationLogo className="w-6 h-6" />
                      ) : (
                        <img
                          src="/api-logo.png"
                          alt="API Logo"
                          className="w-6 h-6 rounded-sm object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{action.name}</p>
                            {action.integration !== "none" && (
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm inline-block mt-1">
                                {action.integration}
                              </span>
                            )}
                          </div>
                          {added && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={added ? "outline" : "default"}
                          onClick={() => onAddAction(action)}
                          disabled={added}
                          className="gap-1.5"
                        >
                          {added ? (
                            <>
                              <Check className="w-3 h-3" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0"></div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
