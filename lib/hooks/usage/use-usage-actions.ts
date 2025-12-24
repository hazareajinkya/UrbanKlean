import { useMutation, useQueryClient } from "@tanstack/react-query";
import usageService from "@/lib/services/usage-service";
import { handleError } from "@/lib/utils";
import { usageKey } from "./use-usage";
import { IUsage } from "@/lib/types/usage";

export const useUsageActions = () => {
  const qc = useQueryClient();

  const addUsage = useMutation({
    mutationFn: async ({
      userId,
      usage,
    }: {
      userId: string;
      usage: IUsage;
    }) => {
      return await usageService.addUsage(userId, usage);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: usageKey(variables.usage.wid) });
    },
    onError: handleError,
  });

  return {
    addUsage,
  };
};

