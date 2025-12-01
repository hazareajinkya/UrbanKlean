"use client";

import { Globe, FileText, Type, NotebookPenIcon, Bot } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

// Import tab components
import {
  WebsiteTab,
  DocumentsTab,
  TextTab,
  TrainTab,
} from "@/components/knowledge";
import QATab from "@/components/knowledge/qa-tab";

export default function KnowledgeBasePage() {
  const searchParams = useSearchParams();
  const { wid } = useParams() as { wid: string };
  const tab = searchParams.get("tab") || "website";

  const tabs = [
    { id: "website", label: "Website", icon: Globe },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "text", label: "Text", icon: Type },
    { id: "train", label: "Train", icon: Bot },
    { id: "qa", label: "QA", icon: NotebookPenIcon },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col ">
      {/* Tab Navigation */}
      <div className="flex w-full bg-card p-1 border-b rounded-ull  gap-0 items-center animate-in fade-in slide-in-from-left-2 duration-300 ">
        {tabs.map((tabItem) => (
          <Link
            key={tabItem.id}
            href={`/workspaces/${wid}/knowledge?tab=${tabItem.id}`}
            className={`flex font-medium rounded-md items-center gap-2 px-3 py-2 text-sm hover:bg-secondary hover:text-primary transition-colors ${
              tab === tabItem.id
                ? "bg-primay/10 border-b-0 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            {tabItem.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 flex-1 overflow-hidden">
        {tab === "website" && <WebsiteTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "text" && <TextTab />}
        {tab === "train" && <TrainTab />}
        {tab === "qa" && <QATab />}
      </div>
    </div>
  );
}
