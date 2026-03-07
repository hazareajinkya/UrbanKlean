"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Search, Check, Loader } from "lucide-react";
import { IWorkflow } from "@/lib/types/workflow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalActions } from "@/lib/hooks/actions/use-ai-actions";
import {
  useInstalledApps,
  usePublishedApps,
  useConnectApp,
} from "@/lib/hooks/apps/use-apps";
import { IApp } from "@/lib/types/app";
import ConnectAppModal from "@/components/apps/connect-app-modal";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const postInstallHandled = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [addingWorkflowId, setAddingWorkflowId] = useState<string | null>(null);

  const [previewWorkflow, setPreviewWorkflow] = useState<IWorkflow | null>(
    null,
  );

  const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
  const [workflowPendingInstall, setWorkflowPendingInstall] =
    useState<IWorkflow | null>(null);
  const [pendingAppsToConnect, setPendingAppsToConnect] = useState<IApp[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { globalActions } = useGlobalActions();
  const { installedApps } = useInstalledApps(wid);
  const { apps } = usePublishedApps();
  const connectMutation = useConnectApp(wid);

  const getMissingAppSlugs = (workflow: IWorkflow): string[] => {
    if (!globalActions) return [];

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

    const missingSlugs: string[] = [];
    for (const appSlug of requiredAppIds) {
      if (!connectedAppSlugs.has(appSlug)) {
        missingSlugs.push(appSlug);
      }
    }

    return missingSlugs;
  };

  const processWorkflowInstallation = async (workflow: IWorkflow) => {
    const missingAppSlugs = getMissingAppSlugs(workflow);

    if (missingAppSlugs.length > 0) {
      const appsToConnect = (apps || []).filter((a) =>
        missingAppSlugs.includes(a.slug),
      );

      if (appsToConnect.length > 0) {
        setWorkflowPendingInstall(workflow);
        setSelectedApp(appsToConnect[0]);
        setPendingAppsToConnect(appsToConnect.slice(1));
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
            if (pendingAppsToConnect.length > 0) {
              const nextApp = pendingAppsToConnect[0];
              setSelectedApp(nextApp);
              setPendingAppsToConnect((prev) => prev.slice(1));
              return;
            }

            setIsModalOpen(false);
            setSelectedApp(null);

            if (workflowPendingInstall) {
              const workflow = workflowPendingInstall;
              setWorkflowPendingInstall(null);
              setAddingWorkflowId(workflow.id);
              Promise.resolve(onAddWorkflow(workflow))
                .catch((err) => console.error("Failed to add workflow:", err))
                .finally(() => setAddingWorkflowId(null));
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

  useEffect(() => {
    if (postInstallHandled.current) return;

    const postInstallAction = searchParams.get("postInstallAction");
    const workflowId = searchParams.get("workflowId");
    const connectStatus = searchParams.get("connectStatus");

    if (
      postInstallAction === "add_workflow" &&
      workflowId &&
      connectStatus === "connected" &&
      globalWorkflows &&
      globalWorkflows.length > 0
    ) {
      postInstallHandled.current = true;

      const url = new URL(window.location.href);
      url.searchParams.delete("postInstallAction");
      url.searchParams.delete("workflowId");
      url.searchParams.delete("connectStatus");
      url.searchParams.delete("appSlug");
      url.searchParams.delete("workspaceId");
      router.replace(url.pathname + url.search, { scroll: false });

      const workflow = globalWorkflows.find((w) => w.id === workflowId);
      if (workflow) {
        processWorkflowInstallation(workflow).catch((err) =>
          console.error("Failed to process workflow installation:", err),
        );
      }
    }
  }, [searchParams, globalWorkflows]);

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
                  className={`flex justify-between items-center gap-4 border rounded-lg bg-background pl-3 pr-1.5 py-2 transition-all ${
                    added
                      ? "opacity-60"
                      : "hover:border-primary/50 cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm  truncate">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {workflow.trigger}
                    </p>
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
          setPendingAppsToConnect([]);
          setWorkflowPendingInstall(null);
        }}
        onConnect={handleModalConnect}
        isConnecting={connectMutation.isPending}
        customRedirectUrl={
          workflowPendingInstall
            ? `${window.location.origin}${window.location.pathname}?postInstallAction=add_workflow&workflowId=${workflowPendingInstall.id}`
            : undefined
        }
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
