"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Folder, Trash2, Pencil, Loader2, X } from "lucide-react";
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
  onMobileClose?: () => void;
}

export default function FolderSidebar({
  selectedFolderId,
  onSelectFolder,
  onMobileClose,
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

  if (isLoading) {
    return (
      <aside className="w-[280px] lg:w-[260px] xl:w-[280px] flex-shrink-0 border-r bg-secondary flex flex-col">
        <div className="h-14 border-b bg-muted/10 px-4 grid place-items-center">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-[280px] lg:w-[260px] xl:w-[280px] flex-shrink-0 border-r bg-secondary flex flex-col h-full">
        {/* Header */}
        <div className="h-14 border-b bg-muted/10 px-4 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-medium text-foreground">Folders</span>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {/* Mobile close button */}
            {onMobileClose && (
              <Button
                onClick={onMobileClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Folder List */}
        <ScrollArea className="flex-1">
          <div className="p-0">
            {folders && folders.length > 0 ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={clsx(
                    "group relative flex items-center justify-between px-4 py-3.5 border-b text-sm transition-all cursor-pointer hover:bg-card/70",
                    selectedFolderId === folder.id
                      ? "bg-card border-l-2 border-l-primary border-b-muted"
                      : "border-l-2 border-l-transparent"
                  )}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Folder
                      className={clsx(
                        "w-4 h-4 shrink-0",
                        selectedFolderId === folder.id
                          ? "text-primary fill-primary/20"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={clsx(
                        "truncate font-medium",
                        selectedFolderId === folder.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {folder.name}
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity",
                      folder.name !== "Miscellaneous" ? "" : "hidden"
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(folder);
                      }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      aria-label="Edit folder"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(folder);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Delete folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Folder className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No folders yet</p>
                <Button
                  variant="link"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2"
                >
                  Create one now
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Create Folder Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        closeModal={() => {
          setIsCreateModalOpen(false);
          setNewFolderName("");
        }}
      >
        <div className="">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h3 className="text-lg font-medium">Create Folder</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewFolderName("");
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., Policies, Products, etc."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
                <Loader2 className="w-4 h-4 animate-spin " />
              )}
              Create Folder
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
        <div className="">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h3 className="text-lg font-medium">Edit Folder</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditModalOpen(false);
                setFolderToEdit(null);
                setEditFolderName("");
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-folder-name">Folder Name</Label>
            <Input
              id="edit-folder-name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              placeholder="Folder Name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditFolder();
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
              {updateFolder.isPending && (
                <Loader2 className="w-4 h-4 animate-spin " />
              )}
              Save Changes
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
