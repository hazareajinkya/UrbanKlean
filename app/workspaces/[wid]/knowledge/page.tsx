"use client";

import { Globe, FileText, Type } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

// Import tab components
import { WebsiteTab, DocumentsTab, TextTab } from "@/components/knowledge";

export default function KnowledgeBasePage() {
  const searchParams = useSearchParams();
  const { wid } = useParams() as { wid: string };
  const tab = searchParams.get("tab") || "website";

  const tabs = [
    { id: "website", label: "Website", icon: Globe },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "text", label: "Text", icon: Type },
  ];

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 items-center mb-6 border-b">
        {tabs.map((tabItem) => (
          <Link
            key={tabItem.id}
            href={`/workspaces/${wid}/knowledge?tab=${tabItem.id}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-md transition-colors ${
              tab === tabItem.id
                ? "bg-background border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            {tabItem.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === "website" && <WebsiteTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "text" && <TextTab />}
      </div>
    </div>
  );
}
