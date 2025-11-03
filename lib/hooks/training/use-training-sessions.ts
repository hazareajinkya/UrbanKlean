import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import trainService from "@/lib/services/train-services";
import { ITraingSession } from "@/lib/types/session";

export const trainingSessionsKey = (wid: string) => ["training-sessions", wid];

export const useTrainingSessions = (wid: string) => {
  return useQuery<ITraingSession[]>({
    queryKey: trainingSessionsKey(wid),
    queryFn: () => trainService.listTrainingSessions(wid),
    enabled: !!wid,
  });
};

export const useTrainingSessionActions = (wid: string) => {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: () => trainService.createTrainingSession(wid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trainingSessionsKey(wid),
      });
    },
  });

  return { createSession };
};
