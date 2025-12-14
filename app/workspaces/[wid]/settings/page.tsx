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
import { Settings2, Globe, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GeneralTab } from "@/components/worksapce/settings/general-tab";
import { DomainsTab } from "@/components/worksapce/settings/domains-tab";
import MembersTab from "@/components/worksapce/settings/members-tab";

const sections = [
  {
    id: "general",
    label: "General",
    icon: Settings2,
    description: "Basic workspace information",
  },
  {
    id: "domains",
    label: "Domains",
    icon: Globe,
    description: "Domain access settings",
  },
  {
    id: "members",
    label: "Members",
    icon: User,
    description: "Manage workspace members",
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
      {/* Top Rail Navigation */}
      <header className="border-b bg-card/50 px-6 pt-4 pb-0">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Workspace Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace information and settings
          </p>
        </div>

        <nav className="flex gap-1" role="tablist">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isDanger = section.id === "danger";

            return (
              <button
                key={section.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-t-lg",
                  isActive
                    ? isDanger
                      ? "text-destructive"
                      : "text-primary"
                    : isDanger
                    ? "text-muted-foreground hover:text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5",
                      isDanger ? "bg-destructive" : "bg-primary"
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeSection === "general" && (
              <GeneralTab workspace={workspace} wid={wid} />
            )}

            {activeSection === "domains" && (
              <DomainsTab workspace={workspace} wid={wid} />
            )}

            {activeSection === "members" && (
              // <MembersTab workspace={workspace} wid={wid} />
              <MembersTab />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
