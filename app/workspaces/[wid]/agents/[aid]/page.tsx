"use client";

import { useAgent } from "@/lib/hooks/agent/use-agent";
import { Button } from "@/components/ui/button";
import {
  Loader,
  ArrowLeft,
  MessageCircle,
  Palette,
  Code,
  HomeIcon,
  ChevronLeft,
  Settings2,
  ListTree,
  MessagesSquare,
  Play,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Import tab components
import {
  OverviewTab,
  ChatTab,
  ChatHistoryTab,
  AppearanceTab,
  WorkflowTab,
  SettingsTab,
  WidgetTab,
} from "@/components/agent";
import clsx from "clsx";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wid, aid } = useParams() as { wid: string; aid: string };
  const tab = searchParams.get("tab") || "overview";

  const { agent, isLoading } = useAgent(aid);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading agent...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Agent not found</h2>
            <p className="text-muted-foreground mb-4">
              The agent you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: HomeIcon },
    { id: "chat", label: "Playground", icon: Play },
    { id: "chat-history", label: "History", icon: MessagesSquare },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "workflow", label: "Workflows", icon: ListTree },
    { id: "settings", label: "Settings", icon: Settings2 },
    { id: "widget", label: "Widget", icon: Code },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 p-0">
      {/* Tab Navigation with Back Button */}
      <div className="flex justify-between border-b bg-card p-1 items-center  animate-in slide-in-from-left-5 fade-in">
        <div className="flex gap-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspaces/${wid}/agents`)}
            className="p-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {tabs.map((tabItem) => (
            <Link
              key={tabItem.id}
              href={`/workspaces/${wid}/agents/${aid}?tab=${tabItem.id}`}
              className={clsx(
                "flex items-center gap-2 px-3.5 py-2 g-secondary text-sm rounded-md transition-all duration-200 hover:text-primary hover:bg-secondary",
                tab === tabItem.id
                  ? "text-primary "
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tabItem.icon className="w-4 h-4" />
              {tabItem.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-1 ">
          <div
            className="overflow-hidden h-6 w-6 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
            style={{ backgroundColor: agent.customization.primaryColor }}
          >
            {agent.customization.botIcon ? (
              <img
                src={agent.customization.botIcon}
                alt="Bot icon"
                className="w-4 h-4"
              />
            ) : (
              <MessageCircle className="w-3 h-3" />
            )}
          </div>
          <span className="text-sm">{agent.customization.name}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {/* Tab Content */}
        <div className=" h-full ">
          {tab === "overview" && <OverviewTab agent={agent} />}
          {tab === "chat" && <ChatTab agent={agent} />}
          {tab === "chat-history" && <ChatHistoryTab agent={agent} />}
          {tab === "appearance" && <AppearanceTab agent={agent} />}
          {tab === "workflow" && <WorkflowTab agent={agent} />}
          {tab === "settings" && <SettingsTab agent={agent} />}
          {tab === "widget" && <WidgetTab agent={agent} wid={wid} aid={aid} />}
        </div>
      </div>
    </div>
  );
}
