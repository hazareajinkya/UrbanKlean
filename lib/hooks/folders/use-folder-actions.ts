import axiosClient from "@/lib/clients/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handleError } from "@/lib/utils";
import folderService from "@/lib/services/folder-service";
import { foldersKey, folderKey } from "./use-folders";

export const useFolderActions = (wid: string) => {
  const qc = useQueryClient();

  const createFolder = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      return await folderService.createFolder(wid, name.trim());
    },
    onSuccess: () => {
      toast.success("Folder created successfully");
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  const updateFolder = useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string;
      name: string;
    }) => {
      return await folderService.updateFolder(wid, folderId, {
        name: name.trim(),
      });
    },
    onSuccess: (_, { folderId }) => {
      toast.success("Folder updated successfully");
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
      qc.invalidateQueries({ queryKey: folderKey(wid, folderId) });
    },
    onError: handleError,
  });

  const deleteFolder = useMutation({
    mutationFn: async ({ folderId }: { folderId: string }) => {
      return await folderService.deleteFolder(wid, folderId);
    },
    onSuccess: () => {
      toast.success("Folder deleted successfully");
      qc.invalidateQueries({ queryKey: foldersKey(wid) });
    },
    onError: handleError,
  });

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  };
};
