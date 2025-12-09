"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Folder, Settings2, Trash2, Pencil, Loader2 } from "lucide-react";
import { useFolders } from "@/lib/hooks/folders/use-folders";

import { Skeleton } from "@/components/ui/skeleton";
import { IFolder } from "@/lib/types/folder";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { useFolderActions } from "@/lib/hooks/folders/use-folder-actions";

interface FolderSidebarProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export default function FolderSidebar({
  selectedFolderId,
  onSelectFolder,
}: FolderSidebarProps) {
  const { wid } = useParams() as { wid: string };
  const { data: folders, isLoading } = useFolders(wid);
  const { createFolder, updateFolder, deleteFolder } = useFolderActions(wid);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<IFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<IFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder.mutate(
      { name: newFolderName.trim() },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewFolderName("");
        },
      }
    );
  };

  const handleEditFolder = () => {
    if (!folderToEdit || !editFolderName.trim()) return;
    updateFolder.mutate(
      { folderId: folderToEdit.id, name: editFolderName.trim() },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setFolderToEdit(null);
          setEditFolderName("");
        },
      }
    );
  };

  const handleDeleteFolder = () => {
    if (!folderToDelete) return;
    deleteFolder.mutate(
      { folderId: folderToDelete.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setFolderToDelete(null);
          if (selectedFolderId === folderToDelete.id) {
            onSelectFolder(null);
          }
        },
      }
    );
  };

  const openEditModal = (folder: IFolder) => {
    setFolderToEdit(folder);
    setEditFolderName(folder.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (folder: IFolder) => {
    setFolderToDelete(folder);
    setIsDeleteModalOpen(true);
  };

  const getItemCount = (folder: IFolder) => {
    return folder.itemCount.total;
  };

  if (isLoading) {
    return (
      <div className="w-[250px] border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[250px] border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Folder
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {folders && folders.length > 0 ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={clsx(
                    "group relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
                    selectedFolderId === folder.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Folder className="w-4 h-4 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({getItemCount(folder)})
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(folder);
                      }}
                      className="p-1 hover:bg-accent rounded"
                      aria-label="Edit folder"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(folder);
                      }}
                      className="p-1 hover:bg-accent rounded text-destructive"
                      aria-label="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No folders yet. Create one to get started.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Create Folder Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        closeModal={() => {
          setIsCreateModalOpen(false);
          setNewFolderName("");
        }}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Create Folder</h3>
          <div>
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || createFolder.isPending}
            >
              {createFolder.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        isOpen={isEditModalOpen}
        closeModal={() => {
          setIsEditModalOpen(false);
          setFolderToEdit(null);
          setEditFolderName("");
        }}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Edit Folder</h3>
          <div>
            <Label htmlFor="edit-folder-name">Folder Name</Label>
            <Input
              id="edit-folder-name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditFolder();
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setFolderToEdit(null);
                setEditFolderName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditFolder}
              disabled={!editFolderName.trim() || updateFolder.isPending}
            >
              {updateFolder.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFolderToDelete(null);
        }}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folderToDelete?.name}"?`}
        warningMessage="This action cannot be undone. All content in this folder will be permanently deleted."
        confirmText="Delete Folder"
        cancelText="Cancel"
        isLoading={deleteFolder.isPending}
        variant="destructive"
      />
    </>
  );
}
