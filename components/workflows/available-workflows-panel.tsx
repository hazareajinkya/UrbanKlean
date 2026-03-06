"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Search, Check, Loader } from "lucide-react";
import { IWorkflow } from "@/lib/types/workflow";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAIActions,
  useGlobalActions,
} from "@/lib/hooks/actions/use-ai-actions";
import {
  useInstalledApps,
  usePublishedApps,
  useConnectApp,
} from "@/lib/hooks/apps/use-apps";
import { IApp } from "@/lib/types/app";
import ConnectAppModal from "@/components/apps/connect-app-modal";
import { useParams } from "next/navigation";
import { WorkflowPreviewModal } from "@/components/workflows/workflow-preview-modal";

interface AvailableWorkflowsPanelProps {
  globalWorkflows: IWorkflow[] | undefined;
  workspaceWorkflows: IWorkflow[] | undefined;
  isLoading?: boolean;
  onAddWorkflow: (workflow: IWorkflow) => void | Promise<void>;
}

export const AvailableWorkflowsPanel = ({
  globalWorkflows = [],
  workspaceWorkflows = [],
  isLoading = false,
  onAddWorkflow,
}: AvailableWorkflowsPanelProps) => {
  const { wid } = useParams() as { wid: string };
  const [searchQuery, setSearchQuery] = useState("");
  const [addingWorkflowId, setAddingWorkflowId] = useState<string | null>(null);

  const [previewWorkflow, setPreviewWorkflow] = useState<IWorkflow | null>(
    null,
  );

  const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
  const [workflowPendingInstall, setWorkflowPendingInstall] =
    useState<IWorkflow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { globalActions } = useGlobalActions();
  const { installedApps } = useInstalledApps(wid);
  const { apps } = usePublishedApps();
  const connectMutation = useConnectApp(wid);

  const getFirstUninstalledAppId = (workflow: IWorkflow) => {
    if (!globalActions) return null;

    const requiredActionIds = new Set(workflow.toolIds);
    const requiredGlobalActions = globalActions.filter((a) =>
      requiredActionIds.has(a.id),
    );

    const requiredAppIds = new Set(
      requiredGlobalActions
        .map((a) => a.app?.slug)
        .filter((slug): slug is string => !!slug),
    );

    const connectedAppSlugs = new Set(
      (installedApps ?? [])
        .filter((a) => a.status === "connected")
        .map((a) => a.appSlug),
    );

    for (const appSlug of requiredAppIds) {
      if (!connectedAppSlugs.has(appSlug)) {
        return appSlug;
      }
    }

    return null;
  };

  const processWorkflowInstallation = async (workflow: IWorkflow) => {
    const missingAppSlug = getFirstUninstalledAppId(workflow);

    if (missingAppSlug) {
      const appToConnect = apps?.find((a) => a.slug === missingAppSlug);
      if (appToConnect) {
        setWorkflowPendingInstall(workflow);
        setSelectedApp(appToConnect);
        setIsModalOpen(true);
        return;
      }
    }

    setAddingWorkflowId(workflow.id);
    try {
      await onAddWorkflow(workflow);
      setWorkflowPendingInstall(null);
    } catch (error) {
      console.error("Failed to add workflow:", error);
    } finally {
      setAddingWorkflowId(null);
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

            if (workflowPendingInstall) {
              setTimeout(() => {
                processWorkflowInstallation(workflowPendingInstall);
              }, 500);
            }
          }
        },
      },
    );
  };

  const handleAddWorkflowClick = (workflow: IWorkflow) => {
    setPreviewWorkflow(workflow);
  };

  const handleConfirmPreview = async () => {
    if (previewWorkflow) {
      await processWorkflowInstallation(previewWorkflow);
      setPreviewWorkflow(null);
    }
  };

  const installedWorkflowIds = new Set(
    workspaceWorkflows
      .map((w) => w.originalId)
      .filter((id): id is string => !!id),
  );

  const filteredWorkflows = !searchQuery.trim()
    ? globalWorkflows
    : globalWorkflows.filter(
        (workflow) =>
          workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workflow.trigger.toLowerCase().includes(searchQuery.toLowerCase()),
      );

  const isWorkflowAdded = (workflow: IWorkflow) => {
    return installedWorkflowIds.has(workflow.id);
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
        <h2 className="text- font-medium mb-2">Available Workflows</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No workflows found matching your search"
                  : "No global workflows available"}
              </p>
            </div>
          ) : (
            filteredWorkflows.map((workflow) => {
              const added = isWorkflowAdded(workflow);
              const isProcessing =
                addingWorkflowId === workflow.id ||
                workflowPendingInstall?.id === workflow.id;

              return (
                <div
                  key={workflow.id}
                  onClick={() =>
                    !added && !isProcessing && handleAddWorkflowClick(workflow)
                  }
                  className={`flex items-center justify-between gap-2 border rounded-lg bg-background pl-3 pr-1.5 py-2 transition-all ${
                    added
                      ? "opacity-60"
                      : "hover:border-primary/50 cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {workflow.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {workflow.trigger}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors flex-shrink-0 ${added ? "opacity-50" : ""}`}
                  >
                    {added ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : isProcessing ? (
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
          setWorkflowPendingInstall(null);
        }}
        onConnect={handleModalConnect}
        isConnecting={connectMutation.isPending}
      />

      <WorkflowPreviewModal
        workflow={previewWorkflow}
        isOpen={!!previewWorkflow}
        onClose={() => setPreviewWorkflow(null)}
        onConfirm={handleConfirmPreview}
        globalActions={globalActions}
        isProcessing={addingWorkflowId === previewWorkflow?.id}
      />
    </div>
  );
};
