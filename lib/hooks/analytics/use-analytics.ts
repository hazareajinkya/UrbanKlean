import { useQuery } from "@tanstack/react-query";
import analyticsService from "@/lib/services/analytics-service";

export const analyticsKey = (wid: string) => ["analytics", wid];
export const analyticsSummaryKey = (wid: string) => ["analytics-summary", wid];
export const analyticsDataKey = (wid: string) => ["analytics-data", wid];

export const useLast7DaysAnalytics = (wid: string) => {
  const query = useQuery({
    queryKey: analyticsKey(wid),
    queryFn: () => analyticsService.getLast7DaysAnalytics(wid),
    enabled: !!wid,
  });

  return {
    dailyAnalytics: query.data ?? [],
    ...query,
  };
};

export const useAnalyticsSummary = (wid: string) => {
  const query = useQuery({
    queryKey: analyticsSummaryKey(wid),
    queryFn: () => analyticsService.getWorkspaceAnalyticsSummary(wid),
    enabled: !!wid,
  });

  return {
    summary: query.data,
    ...query,
  };
};

export const useAnalyticsData = (wid: string) => {
  const query = useQuery({
    queryKey: analyticsDataKey(wid),
    queryFn: () => analyticsService.getAnalyticsData(wid),
    enabled: !!wid,
  });

  return {
    dailyAnalytics: query.data?.dailyAnalytics ?? [],
    summary: query.data?.summary,
    ...query,
  };
};
