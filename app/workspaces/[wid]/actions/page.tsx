"use client";

import { Button } from "@/components/ui/button";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Code, Loader } from "lucide-react";
import { toast } from "sonner";
import {
  useAIActions,
  useGlobalActions,
} from "@/lib/hooks/actions/use-ai-actions";
import { useInstalledApps, usePublishedApps } from "@/lib/hooks/apps/use-apps";
import { useAiActionsActions } from "@/lib/hooks/actions/use-ai-actions-actions";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { AddApiActionModal } from "@/components/actions";
import { WorkspaceActionCard } from "@/components/actions/workspace-action-card";
import { AvailableActionsPanel } from "@/components/actions/available-actions-panel";
import { IAction } from "@/lib/types/actions";
import { CollapsibleTabContainer } from "@/components/ui/collapsible-tab-container";

export default function ActionsPage() {
  const { wid } = useParams() as { wid: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const postInstallHandled = useRef(false);
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<IAction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAction, setDeletingAction] = useState<IAction | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  const { actions: workspaceActions, isLoading: isLoadingWorkspaceActions } =
    useAIActions(wid);

  const { globalActions, isLoading: isLoadingGlobalActions } =
    useGlobalActions();

  const { installedApps } = useInstalledApps(wid);
  const { apps } = usePublishedApps();

  const { deleteAction, toggleActionStatus, addIntegrationAction } =
    useAiActionsActions();

  const handleDeleteAction = () => {
    if (!deletingAction) return;

    deleteAction.mutate(
      { wid, actionId: deletingAction.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setDeletingAction(null);
        },
      },
    );
  };

  const handleToggleStatus = (
    actionId: string,
    status: "active" | "inactive",
  ) => {
    toggleActionStatus.mutate({ wid, actionId, status });
  };

  const handleAddIntegrationAction = async (action: IAction) => {
    await addIntegrationAction.mutateAsync({ wid, globalAction: action });
  };

  useEffect(() => {
    if (postInstallHandled.current) return;

    const postInstallAction = searchParams.get("postInstallAction");
    const actionId = searchParams.get("actionId");
    const connectStatus = searchParams.get("connectStatus");

    if (
      postInstallAction === "add_action" &&
      actionId &&
      connectStatus === "connected" &&
      globalActions &&
      !isLoadingGlobalActions
    ) {
      postInstallHandled.current = true;

      const url = new URL(window.location.href);
      url.searchParams.delete("postInstallAction");
      url.searchParams.delete("actionId");
      url.searchParams.delete("connectStatus");
      url.searchParams.delete("appSlug");
      url.searchParams.delete("workspaceId");
      router.replace(url.pathname + url.search, { scroll: false });

      const action = globalActions.find((a) => a.id === actionId);
      if (action) {
        handleAddIntegrationAction(action)
          .then(() =>
            toast.success(`Action "${action.name}" added successfully`),
          )
          .catch(() =>
            toast.error("Failed to add action after app installation"),
          );
      }
    }
  }, [searchParams, globalActions, isLoadingGlobalActions]);

  const handleEditAction = (action: IAction) => {
    if (action.type === "user") {
      setEditingAction(action);
      setIsAddActionModalOpen(true);
    }
  };

  const handleDeleteActionClick = (action: IAction) => {
    setDeletingAction(action);
    setIsDeleteModalOpen(true);
  };

  const isLoading = isLoadingWorkspaceActions || isLoadingGlobalActions;

  return (
    <CollapsibleTabContainer
      title="Actions"
      description="Manage your workspace actions and add integration actions"
      isLibraryOpen={isLibraryOpen}
      onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
      libraryButtonText="Actions Library"
      createButton={
        <Button
          onClick={() => setIsAddActionModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Action
        </Button>
      }
      sidebarContent={
        <AvailableActionsPanel
          actions={globalActions}
          workspaceActions={workspaceActions}
          installedApps={installedApps}
          apps={apps}
          wid={wid}
          isLoading={isLoadingGlobalActions}
          onAddAction={handleAddIntegrationAction}
        />
      }
      isLoading={isLoading}
      loaderComponent={
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Loading actions...</p>
          </div>
        </div>
      }
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isLibraryOpen ? "xl:grid-cols-3" : ""}`}>
        {workspaceActions && workspaceActions.length > 0 ? (
          workspaceActions.map((action) => (
            <WorkspaceActionCard
              key={action.id}
              action={action}
              onToggleStatus={handleToggleStatus}
              onEdit={action.type === "user" ? handleEditAction : undefined}
              onDelete={handleDeleteActionClick}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No actions in your workspace yet. <br /> Add integration actions
              from the library or create a custom action.
            </p>
          </div>
        )}
      </div>

      {isAddActionModalOpen && (
        <AddApiActionModal
          isOpen={isAddActionModalOpen}
          onClose={() => {
            setIsAddActionModalOpen(false);
            setEditingAction(null);
          }}
          wid={wid}
          editingAction={editingAction}
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAction(null);
        }}
        onConfirm={handleDeleteAction}
        title="Delete Action"
        description={`Are you sure you want to delete "${deletingAction?.name}"? This action cannot be undone.`}
        isLoading={deleteAction.isPending}
      />
    </CollapsibleTabContainer>
  );
}
