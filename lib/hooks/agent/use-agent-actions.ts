import { useMutation, useQueryClient } from "@tanstack/react-query";
import agentService from "@/lib/services/agent-service";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { agentKey, agentsKey } from "./use-agent";

export const useAgentActions = () => {
  const qc = useQueryClient();

  const createAgent = useMutation({
    mutationFn: agentService.createAgent,
    onSuccess: (data, variables) => {
      toast.success("Agent created successfully");
      qc.invalidateQueries({ queryKey: agentsKey() });
    },
    onError: handleError,
  });

  const updateAgent = useMutation({
    mutationFn: agentService.updateAgent,
    onSuccess: (data, variables) => {
      toast.success("Agent updated successfully");
      qc.invalidateQueries({ queryKey: agentKey(variables.aid) });
      qc.invalidateQueries({ queryKey: agentsKey() });
    },
    onError: handleError,
  });

  const deleteAgent = useMutation({
    mutationFn: agentService.deleteAgent,
    onSuccess: (_, variables) => {
      toast.success(`Agent deleted successfully`);
      qc.invalidateQueries({ queryKey: agentsKey() });
    },
    onError: handleError,
  });

  return {
    createAgent,
    updateAgent,
    deleteAgent,
  };
};
