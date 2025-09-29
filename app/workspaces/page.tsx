"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useCurrentUser } from "@/lib/hooks/auth/use-user";
import { useWorkspaces } from "@/lib/hooks/workspace/use-workspace";
import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { IUserWorkspace } from "@/lib/types/user";
import { IWorkspace } from "@/lib/types/workspace";
import { formatDate } from "@/lib/utils";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkspacesPage() {
  const router = useRouter();

  const { user, isLoading: userLoading } = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState<IWorkspace>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<IWorkspace>();

  const wids = user?.workspaces?.map((w: IUserWorkspace) => w.id) || [];

  const { workspaces, isLoading: workspacesLoading } = useWorkspaces(wids);

  const { createWorkspace, updateWorkspace, deleteWorkspace } =
    useWorkspaceActions();

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim() || !user?.email) return;

    createWorkspace.mutate(
      {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
        ownerId: user.email,
      },
      { onSuccess: () => handleCloseModal() }
    );
  };

  const handleUpdateWorkspace = () => {
    if (!workspaceName.trim() || !editingWorkspace || !user?.email) return;

    updateWorkspace.mutate(
      {
        wid: editingWorkspace.id,
        updates: {
          name: workspaceName.trim(),
          description: workspaceDescription.trim(),
        },
      },
      { onSuccess: () => handleCloseModal() }
    );
  };

  const handleSubmit = () => {
    if (editingWorkspace) {
      handleUpdateWorkspace();
    } else {
      handleCreateWorkspace();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setEditingWorkspace(undefined);
  };

  const handleEditWorkspace = (workspace: IWorkspace) => {
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description);
    setIsModalOpen(true);
  };

  const handleDeleteWorkspace = (workspace: IWorkspace) => {
    setDeletingWorkspace(workspace);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWorkspace = () => {
    if (deletingWorkspace) {
      deleteWorkspace.mutate(
        { wid: deletingWorkspace.id },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setDeletingWorkspace(undefined);
          },
        }
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWorkspace(undefined);
  };

  const openCreateModal = () => {
    setEditingWorkspace(undefined);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setIsModalOpen(true);
  };

  if (userLoading) {
    return (
      <div className="mt-12 px-4 md:px-24">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 px-4 md:px-24">
      <div className="flex gap-4 justify-between mb-8">
        <h2 className="text-xl font-medium">Workspaces</h2>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Workspace
        </Button>
      </div>

      {workspacesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
            >
              <div className="relative">
                <img
                  src={workspace.thumbnail}
                  alt={workspace.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditWorkspace(workspace);
                    }}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 bg-white/90 hover:bg-white"
                    disabled={deleteWorkspace.isPending}
                  >
                    {deleteWorkspace.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-medium text-lg">{workspace.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workspace.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 h-[60vh] flex flex-col items-center justify-center">
          <div className="text-muted-foreground mb-4">No workspaces found</div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 " />
            Create Workspace
          </Button>
        </div>
      )}

      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        workspaceDescription={workspaceDescription}
        setWorkspaceDescription={setWorkspaceDescription}
        onSubmit={handleSubmit}
        isLoading={
          editingWorkspace
            ? updateWorkspace.isPending
            : createWorkspace.isPending
        }
        editingWorkspace={editingWorkspace}
      />

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteWorkspace}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${deletingWorkspace?.name}"?`}
        warningMessage="This action cannot be undone. All data associated with this workspace will be permanently removed."
        confirmText="Delete Workspace"
        cancelText="Cancel"
        isLoading={deleteWorkspace.isPending}
        variant="destructive"
      />
    </div>
  );
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceDescription: string;
  setWorkspaceDescription: (description: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  editingWorkspace: IWorkspace | undefined;
}

const WorkspaceModal = ({
  isOpen,
  onClose,
  workspaceName,
  setWorkspaceName,
  workspaceDescription,
  setWorkspaceDescription,
  onSubmit,
  isLoading,
  editingWorkspace,
}: WorkspaceModalProps) => {
  const isEditing = !!editingWorkspace;
  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-medium">
            {isEditing ? "Edit Workspace" : "Create New Workspace"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground max-w-[80%]">
          {isEditing
            ? "Update your workspace name and settings."
            : "Organize your agents and collaborate with your team."}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="workspaceName">Company Name</Label>
            <Input
              id="workspaceName"
              type="text"
              placeholder="Delightfulcx"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="workspaceDescription">
              What your company does in one line?
            </Label>
            <Input
              id="workspaceDescription"
              type="text"
              placeholder="e.g. We help businesses automate their customer support"
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!workspaceName.trim() || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin " />}
              {isEditing ? "Update Workspace" : "Create Workspace"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
