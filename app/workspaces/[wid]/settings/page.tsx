"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Settings2, Globe, User, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GeneralTab } from "@/components/worksapce/settings/general-tab";
import { DomainsTab } from "@/components/worksapce/settings/domains-tab";
import MembersTab from "@/components/worksapce/settings/members-tab";
import BillingTab from "@/components/worksapce/settings/billing-tab";

const sections = [
  {
    id: "general",
    label: "General",
    icon: Settings2,
  },
  {
    id: "domains",
    label: "Domains",
    icon: Globe,
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    id: "members",
    label: "Members",
    icon: User,
  },
];

export default function SettingsPage() {
  const { wid } = useParams() as { wid: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSection = searchParams.get("section") || "general";

  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace(wid);
  useWorkspaceActions();

  const handleSectionChange = (sectionId: string) => {
    router.push(`/workspaces/${wid}/settings?section=${sectionId}`, {
      scroll: false,
    });
  };

  if (isWorkspaceLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex gap-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Workspace not found</CardTitle>
            <CardDescription>
              The workspace you are trying to access does not exist or you no
              longer have permission.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation Rail */}
      <div className="flex justify-between border-b bg-card p-1 items-center animate-in slide-in-from-left-5 fade-in">
        <div className="flex gap-1 items-center px-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 text-sm rounded-md transition-all duration-200",
                  isActive
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto p-8 space-y-6 max-w-5xl">
          <AnimatePresence mode="wait">
            {activeSection === "general" && (
              <GeneralTab workspace={workspace} wid={wid} />
            )}

            {activeSection === "domains" && (
              <DomainsTab workspace={workspace} wid={wid} />
            )}

            {activeSection === "members" && <MembersTab />}

            {activeSection === "billing" && <BillingTab wid={wid} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
