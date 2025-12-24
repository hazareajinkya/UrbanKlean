import { useQuery } from "@tanstack/react-query";
import usageService from "@/lib/services/usage-service";

export const usageKey = (wid: string) => ["usage", wid];

export const useUsage = (wid: string) => {
  return useQuery({
    queryKey: usageKey(wid),
    queryFn: () => usageService.getUsage(wid),
    enabled: !!wid,
  });
};

