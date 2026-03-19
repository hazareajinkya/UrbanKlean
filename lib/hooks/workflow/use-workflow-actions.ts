import { useMutation, useQueryClient } from "@tanstack/react-query";
import workflowService from "@/lib/services/workflow-service";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { workflowKey, workflowsKey } from "./use-workflow";
import { IWorkflow } from "@/lib/types/workflow";
import { actionsKey } from "../actions/use-ai-actions";

export const useWorkflowActions = () => {
  const qc = useQueryClient();

  const createWorkflow = useMutation({
    mutationFn: workflowService.createWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow created successfully");
      qc.invalidateQueries({ queryKey: workflowsKey(variables.wid) });
    },
    onError: handleError,
  });

  const updateWorkflow = useMutation({
    mutationFn: workflowService.updateWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow updated successfully");
      qc.invalidateQueries({
        queryKey: workflowKey(variables.wid, variables.workflowId),
      });
      qc.invalidateQueries({ queryKey: workflowsKey(variables.wid) });
    },
    onError: handleError,
  });

  const deleteWorkflow = useMutation({
    mutationFn: workflowService.deleteWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow deleted successfully");
      qc.invalidateQueries({ queryKey: workflowsKey(variables.wid) });
    },
    onError: handleError,
  });

  const toggleWorkflowStatus = useMutation({
    mutationFn: workflowService.toggleWorkflowStatus,
    onMutate: async (variables) => {
      const { wid, workflowId, isActive } = variables;
      await qc.cancelQueries({ queryKey: workflowsKey(wid) });
      const previousWorkflows = qc.getQueryData<IWorkflow[]>(workflowsKey(wid));
      if (previousWorkflows) {
        qc.setQueryData<IWorkflow[]>(workflowsKey(wid), (old) => {
          if (!old) return old;
          return old.map((w) =>
            w.id === workflowId
              ? { ...w, isActive, updatedAt: new Date().toISOString() }
              : w,
          );
        });
      }
      return { previousWorkflows };
    },
    onError: (err, variables, context) => {
      if (context?.previousWorkflows) {
        qc.setQueryData(workflowsKey(variables.wid), context.previousWorkflows);
      }
      handleError(err);
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: workflowsKey(variables.wid) });
    },
  });

  const addIntegrationWorkflow = useMutation({
    mutationFn: workflowService.addIntegrationWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow added to workspace");
      qc.invalidateQueries({ queryKey: workflowsKey(variables.wid) });
      // Also invalidate actions since new actions may have been auto-installed
      qc.invalidateQueries({ queryKey: actionsKey(variables.wid) });
    },
    onError: handleError,
  });

  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    addIntegrationWorkflow,
  };
};
