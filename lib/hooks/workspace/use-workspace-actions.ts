import { useMutation, useQueryClient } from "@tanstack/react-query";
import workspaceService from "@/lib/services/workspace-service";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { workspaceKey } from "./use-workspace";
import { userKey } from "../auth/use-user";
import { IWorkspace } from "@/lib/types/workspace";
import { auth } from "@/lib/clients/firebase";

export const useWorkspaceActions = () => {
  const qc = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (data, variables) => {
      toast.success("Workspace created successfully");
      qc.invalidateQueries({ queryKey: userKey(variables.ownerId) });
    },
    onError: handleError,
  });

  const updateWorkspace = useMutation({
    mutationFn: workspaceService.updateWorkspace,
    onSuccess: (data, variables) => {
      toast.success("Workspace updated successfully");
      qc.invalidateQueries({ queryKey: workspaceKey(variables.wid) });
    },
    onError: handleError,
  });

  const deleteWorkspace = useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: (_, variables) => {
      toast.success(`Workspace deleted successfully`);
      const email = auth.currentUser?.email ?? "";
      qc.invalidateQueries({ queryKey: userKey(email) });
    },
    onError: handleError,
  });

  return {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
};
