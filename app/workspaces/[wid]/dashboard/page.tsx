"use client";

import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const { wid } = useParams() as { wid: string };

  const { workspace, isLoading } = useWorkspace(wid);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-medium">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Here you can view analytics and manage your workspace
      </p>
    </div>
  );
}
