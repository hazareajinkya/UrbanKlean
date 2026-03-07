"use client";

import { Button } from "@/components/ui/button";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Plus, ListTree, Loader } from "lucide-react";
import { useWorkflows } from "@/lib/hooks/workflow/use-workflow";
import { useGlobalWorkflows } from "@/lib/hooks/workflow/use-global-workflows";
import { useWorkflowActions } from "@/lib/hooks/workflow/use-workflow-actions";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { WorkflowModal } from "@/components/workflows";
import { WorkspaceWorkflowCard } from "@/components/workflows/workspace-workflow-card";
import { AvailableWorkflowsPanel } from "@/components/workflows/available-workflows-panel";
import { IWorkflow, generateDefaultWorkflow } from "@/lib/types/workflow";

export default function WorkflowsPage() {
  const { wid } = useParams() as { wid: string };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<IWorkflow | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkflow, setDeletingWorkflow] = useState<IWorkflow | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    trigger: "",
    instructions: "",
  });

  const { workflows: workspaceWorkflows, isLoading: isLoadingWorkflows } =
    useWorkflows(wid);

  const { globalWorkflows, isLoading: isLoadingGlobalWorkflows } =
    useGlobalWorkflows();

  const {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    addIntegrationWorkflow,
  } = useWorkflowActions();

  const handleSubmit = (e: React.FormEvent, toolIds: string[]) => {
    e.preventDefault();

    if (editingWorkflow) {
      updateWorkflow.mutate(
        {
          wid,
          workflowId: editingWorkflow.id,
          updates: {
            name: formData.name,
            trigger: formData.trigger,
            instructions: formData.instructions,
            toolIds,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        },
      );
    } else {
      const workflow = generateDefaultWorkflow({
        wid,
        type: "user",
        name: formData.name,
        trigger: formData.trigger,
        instructions: formData.instructions,
        toolIds,
      });

      createWorkflow.mutate(
        { wid, workflow },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        },
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkflow(null);
    setFormData({ name: "", trigger: "", instructions: "" });
  };

  const handleEditWorkflow = (workflow: IWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      trigger: workflow.trigger,
      instructions: workflow.instructions,
    });
    setIsModalOpen(true);
  };

  const handleDeleteWorkflowClick = (workflow: IWorkflow) => {
    setDeletingWorkflow(workflow);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteWorkflow = () => {
    if (!deletingWorkflow) return;

    deleteWorkflow.mutate(
      { wid, workflowId: deletingWorkflow.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setDeletingWorkflow(null);
        },
      },
    );
  };

  const handleToggleStatus = (workflowId: string, isActive: boolean) => {
    toggleWorkflowStatus.mutate({ wid, workflowId, isActive });
  };

  const handleUpdateAgents = async (workflowId: string, aids: string[]) => {
    await updateWorkflow.mutateAsync({
      wid,
      workflowId,
      updates: {
        aids,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const handleAddIntegrationWorkflow = async (workflow: IWorkflow) => {
    await addIntegrationWorkflow.mutateAsync({ wid, globalWorkflow: workflow });
  };

  return (
    <div className="p-4 h-[calc(100vh-3rem)] flex justify-between gap-4">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium">Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Manage your workspace workflows and add integration workflows
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Workflow
          </Button>
        </div>

        {isLoadingWorkflows ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading workflows...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                {workspaceWorkflows && workspaceWorkflows.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaceWorkflows.map((workflow) => (
                      <WorkspaceWorkflowCard
                        key={workflow.id}
                        workflow={workflow}
                        onToggleStatus={handleToggleStatus}
                        onEdit={handleEditWorkflow}
                        onDelete={handleDeleteWorkflowClick}
                        onUpdateAgents={handleUpdateAgents}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ListTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No workflows in your workspace yet. <br /> Add integration
                      workflows from the right panel or create a custom
                      workflow.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-[340px] flex-shrink-0 border rounded-lg p-4 bg-card">
        <AvailableWorkflowsPanel
          globalWorkflows={globalWorkflows}
          workspaceWorkflows={workspaceWorkflows}
          isLoading={isLoadingGlobalWorkflows}
          onAddWorkflow={handleAddIntegrationWorkflow}
        />
      </div>

      <WorkflowModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={createWorkflow.isPending || updateWorkflow.isPending}
        isEditing={!!editingWorkflow}
      />

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingWorkflow(null);
        }}
        onConfirm={handleDeleteWorkflow}
        title="Delete Workflow"
        description={`Are you sure you want to delete "${deletingWorkflow?.name}"? This action cannot be undone.`}
        isLoading={deleteWorkflow.isPending}
      />
    </div>
  );
}
