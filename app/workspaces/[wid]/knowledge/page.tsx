"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import QATab from "@/components/knowledge/qa-tab";
import TrainTab from "@/components/knowledge/train-tab";
import { Book, GraduationCap, MessageSquare } from "lucide-react";
import clsx from "clsx";
import KnowledgeTab from "@/components/knowledge/knowledge-tab";

type TabType = "knowledge" | "training" | "qa";

export default function KnowledgeBasePage() {
  const { wid } = useParams() as { wid: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const activeTab: TabType = tabParam || "knowledge";

  const handleTabChange = (tab: TabType) => {
    router.push(
      `/workspaces/${wid}/knowledge${tab === "knowledge" ? "" : `?tab=${tab}`}`
    );
  };

  const tabs = [
    { id: "knowledge" as const, label: "Knowledge", icon: Book },
    {
      id: "training" as const,
      label: "Training",
      icon: GraduationCap,
    },
    { id: "qa" as const, label: "QA", icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between border-b bg-card p-1 items-center animate-in slide-in-from-left-5 fade-in">
        <div className="flex gap-1 items-center">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id)}
              className={clsx(
                "flex items-center gap-2 px-3.5 py-2 text-sm rounded-md transition-all duration-200 hover:text-primary hover:bg-secondary/80",
                activeTab === tabItem.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tabItem.icon className="w-4 h-4" />
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex min-h-0 bg-background/50">
        {activeTab === "knowledge" && (
          <div className="flex-1 flex min-h-0 p-4">
            <KnowledgeTab />
          </div>
        )}

        {activeTab === "training" && (
          <div className="flex-1 overflow-hidden">
            <TrainTab />
          </div>
        )}

        {activeTab === "qa" && (
          <div className="flex-1 overflow-hidden p-4">
            <QATab />
          </div>
        )}
      </div>
    </div>
  );
}
