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
  const [actionPendingInstall, setActionPendingInstall] =
    useState<IAction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connectMutation = useConnectApp(wid);

  const handleAddAction = async (action: IAction) => {
    if (action.app?.slug) {
      const isAppInstalled = (installedApps ?? []).some(
        (a) => a.appSlug === action.app?.slug && a.status === "connected",
      );

      if (!isAppInstalled) {
        const appToConnect = apps.find((a) => a.slug === action.app?.slug);
        if (appToConnect) {
          setActionPendingInstall(action);
          setSelectedApp(appToConnect);
          setIsModalOpen(true);
          return;
        }
      }
    }

    setAddingActionId(action.id);
    try {
      await onAddAction(action);
      setActionPendingInstall(null);
    } catch (error) {
      console.error("Failed to add action:", error);
    } finally {
      setAddingActionId(null);
    }
  };

  const handleModalConnect = async (
    settings: Record<string, any>,
    customRedirectUrl?: string,
  ) => {
    if (!selectedApp) return;
    connectMutation.mutate(
      { app: selectedApp, settings, customRedirectUrl },
      {
        onSuccess: (data) => {
          if (!data?.redirected) {
            setIsModalOpen(false);
            setSelectedApp(null);

            if (actionPendingInstall) {
              const action = actionPendingInstall;
              setActionPendingInstall(null);
              setAddingActionId(action.id);
              Promise.resolve(onAddAction(action))
                .catch((err) => console.error("Failed to add action:", err))
                .finally(() => setAddingActionId(null));
            }
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

  const installedAppSlugs = new Set(
    (installedApps ?? [])
      .filter((a) => a.status === "connected")
      .map((a) => a.appSlug),
  );

  // Bug: This code have bug it not showing the actions that are in the installed apps
  // const availableActions = actions.filter(
  //   (action) => !action.app?.slug || !installedAppSlugs.has(action.app.slug),
  // );

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
        <h2 className="text- font-medium mb-2">Available Actions</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted"
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
                  onClick={() =>
                    !added &&
                    addingActionId !== action.id &&
                    handleAddAction(action)
                  }
                  className={`flex items-center justify-between gap-2 border rounded-lg bg-background pl-3 pr-1.5 py-2 transition-all ${
                    added
                      ? "opacity-60"
                      : "hover:border-primary/50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={parentName}
                        className="w-6 h-6 rounded object-contain bg-background border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-primary flex-shrink-0">
                        <span className="font-bold text-[10px]">API</span>
                      </div>
                    )}
                    <span className="text-sm truncate">{action.name}</span>
                  </div>

                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors flex-shrink-0 ${added ? "opacity-50" : ""}`}
                  >
                    {added ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : addingActionId === action.id ? (
                      <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
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
          setActionPendingInstall(null);
        }}
        onConnect={handleModalConnect}
        isConnecting={connectMutation.isPending}
        customRedirectUrl={
          actionPendingInstall
            ? `${window.location.origin}${window.location.pathname}?postInstallAction=add_action&actionId=${actionPendingInstall.id}`
            : undefined
        }
      />
    </div>
  );
};
