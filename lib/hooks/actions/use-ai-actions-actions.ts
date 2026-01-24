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

  const toggleActionStatus = useMutation({
    mutationFn: actionService.toggleActionStatus,
    onMutate: async (variables) => {
      const { wid, actionId, status } = variables;
      await qc.cancelQueries({ queryKey: actionsKey(wid) });
      const previousActions = qc.getQueryData<IAction[]>(actionsKey(wid));
      if (previousActions) {
        qc.setQueryData<IAction[]>(actionsKey(wid), (old) => {
          if (!old) return old;
          return old.map((action) =>
            action.id === actionId
              ? { ...action, status, updatedAt: new Date().toISOString() }
              : action,
          );
        });
      }

      return { previousActions };
    },
    onError: (err, variables, context) => {
      if (context?.previousActions) {
        qc.setQueryData(actionsKey(variables.wid), context.previousActions);
      }
      handleError(err);
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: actionsKey(variables.wid) });
    },
  });

  const addIntegrationAction = useMutation({
    mutationFn: actionService.addIntegrationAction,
    onMutate: async (variables) => {
      const { wid, globalAction } = variables;

      await qc.cancelQueries({ queryKey: actionsKey(wid) });

      const previousActions = qc.getQueryData<IAction[]>(actionsKey(wid));

      qc.setQueryData<IAction[]>(actionsKey(wid), (old) => {
        if (!old) return [globalAction];

        if (
          old.some(
            (a) =>
              a.slug === globalAction.slug &&
              a.integration === globalAction.integration,
          )
        )
          return old;

        return [
          ...old,
          {
            ...globalAction,
            id: "temp-" + Date.now(),
            wid,
            type: "integration",
          },
        ];
      });

      return { previousActions };
    },
    onSuccess: (_, variables) => {
      toast.success("Action added to workspace");
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousActions) {
        qc.setQueryData(actionsKey(variables.wid), context.previousActions);
      }
      handleError(err);
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure we have the latest data
      qc.invalidateQueries({ queryKey: actionsKey(variables.wid) });
    },
  });

  return {
    saveAction,
    updateAction,
    deleteAction,
    toggleActionStatus,
    addIntegrationAction,
  };
};
