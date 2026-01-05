import { useQuery } from "@tanstack/react-query";
import usageService from "@/lib/services/usage-service";
import { useCurrentUser } from "../user/use-user";

export const globalUsageKey = ["usage"];
export const usageKey = (wid: string) => ["usage", wid];

export const useUsage = (wid: string) => {
  return useQuery({
    queryKey: usageKey(wid),
    queryFn: () => usageService.getUsage(wid),
    enabled: !!wid,
  });
};

export const useGlobalUsage = (dateRange?: { from?: Date; to?: Date }) => {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: [
      ...globalUsageKey,
      dateRange
        ? `${dateRange.from?.toISOString()}-${dateRange.to?.toISOString()}`
        : "all",
    ],
    queryFn: () => usageService.getGlobalUsage(user?.email ?? "", dateRange),
    enabled: !!user?.email,
  });
};
