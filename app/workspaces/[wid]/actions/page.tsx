"use client";

import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Plus, Code, Loader } from "lucide-react";
import { useAIActions } from "@/lib/hooks/actions/use-ai-actions";
import { useAiActionsActions } from "@/lib/hooks/actions/use-ai-actions-actions";
import { useIntegrations } from "@/lib/hooks/integrations/use-integrations";
import { useGlobalActions } from "@/lib/hooks/actions/use-global-actions";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { AddApiActionModal } from "@/components/actions";
import { WorkspaceActionCard } from "@/components/actions/workspace-action-card";
import { AvailableActionsPanel } from "@/components/actions/available-actions-panel";
import { IAction } from "@/lib/types/actions";

export default function ActionsPage() {
  const { wid } = useParams() as { wid: string };
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<IAction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAction, setDeletingAction] = useState<IAction | null>(null);

  const { actions: workspaceActions, isLoading: isLoadingWorkspaceActions } =
    useAIActions(wid);
  const { integrations, isLoading: isLoadingIntegrations } =
    useIntegrations(wid);

  const integrationTypes = useMemo(() => {
    if (!integrations) return [];
    return integrations
      .filter((integration) => integration.status === "active")
      .map((integration) => integration.type);
  }, [integrations]);

  const { actions: globalActions, isLoading: isLoadingGlobalActions } =
    useGlobalActions(integrationTypes);

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

  const isLoading =
    isLoadingWorkspaceActions ||
    isLoadingIntegrations ||
    isLoadingGlobalActions;

  return (
    <div className="p-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Actions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace actions and add integration actions
          </p>
        </div>
        <Button
          onClick={() => setIsAddActionModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Custom Action
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Loading actions...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              {workspaceActions && workspaceActions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workspaceActions.map((action) => (
                    <WorkspaceActionCard
                      key={action.id}
                      action={action}
                      onToggleStatus={handleToggleStatus}
                      onEdit={
                        action.type === "user" ? handleEditAction : undefined
                      }
                      onDelete={handleDeleteActionClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No actions in your workspace yet. <br /> Add integration
                    actions from the right panel or create a custom action.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-[340px] flex-shrink-0 border rounded-lg p-4 bg-background">
            <AvailableActionsPanel
              actions={globalActions}
              workspaceActions={workspaceActions}
              isLoading={isLoadingGlobalActions}
              onAddAction={handleAddIntegrationAction}
            />
          </div>
        </div>
      )}

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
    </div>
  );
}
