import qaService from "@/lib/services/qa-service";
import { useQuery } from "@tanstack/react-query";

export const qaKey = (wid: string) => ["qa", wid];

export const useQA = (wid: string) => {
  return useQuery({
    queryKey: qaKey(wid),
    queryFn: () => qaService.getQA(wid),
    enabled: !!wid,
  });
};
