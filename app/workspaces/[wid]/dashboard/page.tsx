"use client";

import { useAnalyticsData } from "@/lib/hooks/analytics/use-analytics";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useParams } from "next/navigation";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default function DashboardPage() {
  const { wid } = useParams() as { wid: string };

  const { workspace, isLoading: workspaceLoading } = useWorkspace(wid);

  const {
    data,
    dailyAnalytics,
    summary,
    isLoading: analyticsLoading,
  } = useAnalyticsData(wid);

  console.log(data);

  const isLoading = workspaceLoading || analyticsLoading;

  return (
    <div className="p-4 md:p-6">
      <AnalyticsDashboard
        dailyAnalytics={dailyAnalytics}
        summary={summary ?? null}
        isLoading={isLoading}
      />
    </div>
  );
}
