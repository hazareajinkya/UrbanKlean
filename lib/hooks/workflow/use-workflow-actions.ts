import { useMutation, useQueryClient } from "@tanstack/react-query";
import workflowService from "@/lib/services/workflow-service";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { workflowKey, workflowsKey } from "./use-workflow";
import { IWorkflow, generateDefaultWorkflow } from "@/lib/types/workflow";

export const useWorkflowActions = () => {
  const qc = useQueryClient();

  const createWorkflow = useMutation({
    mutationFn: workflowService.createWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow created successfully");
      qc.invalidateQueries({ queryKey: workflowsKey(variables.aid) });
    },
    onError: handleError,
  });

  const updateWorkflow = useMutation({
    mutationFn: workflowService.updateWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow updated successfully");
      qc.invalidateQueries({
        queryKey: workflowKey(variables.aid, variables.workflowId),
      });
      qc.invalidateQueries({ queryKey: workflowsKey(variables.aid) });
    },
    onError: handleError,
  });

  const deleteWorkflow = useMutation({
    mutationFn: workflowService.deleteWorkflow,
    onSuccess: (_, variables) => {
      toast.success("Workflow deleted successfully");
      qc.invalidateQueries({ queryKey: workflowsKey(variables.aid) });
    },
    onError: handleError,
  });

  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
};
