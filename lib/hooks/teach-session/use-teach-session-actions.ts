import { useMutation, useQueryClient } from "@tanstack/react-query";
import teachService from "@/lib/services/teach-services";
import { teachSessionKey } from "./use-teach-session";

export const useTeachSessionActions = (wid: string) => {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: () => teachService.createTeachSession(wid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teachSessionKey(wid),
      });
    },
  });

  return { createSession };
};
