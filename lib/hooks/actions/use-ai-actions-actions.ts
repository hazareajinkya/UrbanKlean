import { useMutation, useQueryClient } from "@tanstack/react-query";
import actionService from "@/lib/services/action-service";
import { toast } from "sonner";
import { handleError, getwid } from "@/lib/utils";
import { actionKey, actionsKey } from "./use-ai-actions";
import { IAction } from "@/lib/types/actions";

export const useAiActionsActions = () => {
  const qc = useQueryClient();

  const saveAction = useMutation({
    mutationFn: actionService.saveAction,
    onSuccess: (data, variables) => {
      toast.success("Action saved successfully");
      const { wid } = variables;
      qc.invalidateQueries({ queryKey: actionsKey(wid) });
    },
    onError: handleError,
  });

  const updateAction = useMutation({
    mutationFn: actionService.updateAction,
    onSuccess: (data, variables) => {
      toast.success("Action updated successfully");
      const { wid } = variables;
      qc.invalidateQueries({ queryKey: actionsKey(wid) });
    },
    onError: handleError,
  });

  const deleteAction = useMutation({
    mutationFn: actionService.deleteAction,
    onSuccess: (_, variables) => {
      toast.success("Action deleted successfully");
      const { wid } = variables;
      qc.invalidateQueries({ queryKey: actionsKey(wid) });
      qc.removeQueries({ queryKey: actionKey(wid, variables.actionId) });
    },
    onError: handleError,
  });

  return {
    saveAction,
    updateAction,
    deleteAction,
  };
};
