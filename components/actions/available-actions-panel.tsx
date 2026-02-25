"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Plus, Search, Check } from "lucide-react";
import { IAction } from "@/lib/types/actions";
import { IApp, IInstalledApp } from "@/lib/types/app";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import { Loader } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import ConnectAppModal from "@/components/apps/connect-app-modal";
import { useConnectApp } from "@/lib/hooks/apps/use-apps";

interface AvailableActionsPanelProps {
  actions: IAction[] | undefined;
  workspaceActions: IAction[] | undefined;
  installedApps?: IInstalledApp[];
  apps?: IApp[];
  wid: string;
  isLoading?: boolean;
  onAddAction: (action: IAction) => void | Promise<void>;
}

export const AvailableActionsPanel = ({
  actions = [],
  workspaceActions = [],
  installedApps,
  apps = [],
  wid,
  isLoading = false,
  onAddAction,
}: AvailableActionsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingActionId, setAddingActionId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connectMutation = useConnectApp(wid);

  const handleAddAction = async (action: IAction) => {
    // Check if the action belongs to an app that is not yet installed
    if (action.app?.slug) {
      const isAppInstalled = (installedApps ?? []).some(
        (a) => a.appSlug === action.app?.slug && a.status === "connected",
      );

      if (!isAppInstalled) {
        const appToConnect = apps.find((a) => a.slug === action.app?.slug);
        if (appToConnect) {
          setSelectedApp(appToConnect);
          setIsModalOpen(true);
          return;
        }
      }
    }

    setAddingActionId(action.id);
    try {
      await onAddAction(action);
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setAddingActionId(null);
    }
  };

  const handleModalConnect = async (settings: Record<string, any>) => {
    if (!selectedApp) return;
    connectMutation.mutate(
      { app: selectedApp, settings },
      {
        onSuccess: (data) => {
          if (!data?.redirected) {
            setIsModalOpen(false);
            setSelectedApp(null);
          }
        },
      },
    );
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

  const availableActions = actions;

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

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className=" space-y-3">
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
                  <div className="flex items-start justify-between ">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={parentName}
                            className="w-10 h-10 rounded-lg object-contain bg-background border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <span className="font-bold text-xs">API</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm leading-tight mb-1">
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
                      className={`text-xs ${added ? "bg-background" : ""}`}
                    >
                      {added ? (
                        <>Added</>
                      ) : addingActionId === action.id ? (
                        <>Adding</>
                      ) : (
                        <>Add</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <ConnectAppModal
        app={selectedApp}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApp(null);
        }}
        onConnect={handleModalConnect}
        isConnecting={connectMutation.isPending}
      />
    </div>
  );
};
