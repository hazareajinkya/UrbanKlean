"use client";

import { useState } from "react";
import { IAgent } from "@/lib/types/agent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Plus, Workflow, Edit, Trash2, ListTree } from "lucide-react";
import { useWorkflows } from "@/lib/hooks/workflow/use-workflow";
import { useWorkflowActions } from "@/lib/hooks/workflow/use-workflow-actions";
import { generateDefaultWorkflow, IWorkflow } from "@/lib/types/workflow";
import { WorkflowModal } from "@/components/workflows";

interface WorkflowTabProps {
  agent: IAgent;
}

export default function WorkflowTab({ agent }: WorkflowTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<IWorkflow | null>(
    null,
  );
  const [deletingWorkflow, setDeletingWorkflow] = useState<IWorkflow | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    trigger: "",
    instructions: "",
  });

  const { workflows, isLoading: workflowsLoading } = useWorkflows(agent.wid);
  const { createWorkflow, updateWorkflow, deleteWorkflow } =
    useWorkflowActions();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent, toolIds: string[]) => {
    e.preventDefault();

    if (editingWorkflow) {
      // Update existing workflow
      updateWorkflow.mutate(
        {
          wid: agent.wid,
          workflowId: editingWorkflow.id,
          updates: {
            name: formData.name,
            trigger: formData.trigger,
            instructions: formData.instructions,
            toolIds: toolIds,
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
      // Create new workflow
      const workflow = generateDefaultWorkflow({
        wid: agent.wid,
        type: "user",
        name: formData.name,
        trigger: formData.trigger,
        instructions: formData.instructions,
        toolIds,
      });

      createWorkflow.mutate(
        { wid: agent.wid, workflow },
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

  const handleDeleteWorkflow = (workflow: IWorkflow) => {
    setDeletingWorkflow(workflow);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWorkflow = () => {
    if (deletingWorkflow) {
      deleteWorkflow.mutate(
        { wid: agent.wid, workflowId: deletingWorkflow.id },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setDeletingWorkflow(null);
          },
        },
      );
    }
  };

  // Filter workflows that belong to this agent (via aids array)
  const agentWorkflows = workflows?.filter(
    (w) => w.aids.length === 0 || w.aids.includes(agent.id),
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Workflows</h2>
          <p className="text-sm text-muted-foreground ">
            Automate tasks and create custom workflows for your agent
          </p>
        </div>

        <Button
          className="flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflowsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agentWorkflows && agentWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={() => handleEditWorkflow(workflow)}
                onDelete={() => handleDeleteWorkflow(workflow)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ListTree className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mb-2">No workflows yet</CardTitle>
              <CardDescription className="text-center max-w-sm">
                Create your first workflow to automate tasks and provide
                structured responses for your agent.
              </CardDescription>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 " />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workflow Modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={createWorkflow.isPending || updateWorkflow.isPending}
        isEditing={!!editingWorkflow}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingWorkflow(null);
        }}
        onConfirm={confirmDeleteWorkflow}
        title="Delete Workflow"
        description={`Are you sure you want to delete "${deletingWorkflow?.name}"?`}
        warningMessage="This action cannot be undone. The workflow will be permanently removed."
        confirmText="Delete Workflow"
        cancelText="Cancel"
        isLoading={deleteWorkflow.isPending}
        variant="destructive"
      />
    </div>
  );
}

interface WorkflowCardProps {
  workflow: IWorkflow;
  onEdit: () => void;
  onDelete: () => void;
}

const WorkflowCard = ({ workflow, onEdit, onDelete }: WorkflowCardProps) => {
  return (
    <Card className="py-0 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative group h-fit">
      {/* Action buttons - top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 w-7 p-0 bg-white/80 hover:bg-white"
        >
          <Edit className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 bg-white/80 hover:bg-white"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Workflow Name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {workflow.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                workflow.isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs text-gray-600">
              {workflow.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Trigger */}
        <div>
          <p className="text-sm text-gray-700 font-medium mb-1">
            This workflow will run when:
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {workflow.trigger}
          </p>
        </div>

        {/* Instructions */}
        <div>
          <p className="text-sm text-gray-700 font-medium mb-1">
            Instructions:
          </p>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 whitespace-pre-line">
            {workflow.instructions}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
