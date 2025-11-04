import { useQuery } from "@tanstack/react-query";
import trainService from "@/lib/services/train-services";

export const trainedContentKey = (wid: string) => ["trained-content", wid];

export const useTrainedContent = (wid: string) => {
  return useQuery({
    queryKey: trainedContentKey(wid),
    queryFn: async () => {
      if (!wid)
        return [] as Array<{ id: string; title: string; description: string }>;
      return await trainService.getTrainedContent(wid);
    },
    enabled: Boolean(wid),
  });
};
