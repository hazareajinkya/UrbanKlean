"use client";

import { useAgent } from "@/lib/hooks/agent/use-agent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  Palette,
  Settings,
  Code,
  LayoutDashboard,
  HomeIcon,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Import tab components
import {
  OverviewTab,
  ChatTab,
  AppearanceTab,
  SettingsTab,
  WidgetTab,
} from "@/components/agent";

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
            <Loader2 className="w-6 h-6 animate-spin" />
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
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "widget", label: "Widget", icon: Code },
  ];

  return (
    <div className="p-4">
      {/* Tab Navigation with Back Button */}
      <div className="flex justify-between items-center mb-6 border-b">
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspaces/${wid}/agents`)}
            className="p-2 mr-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {tabs.map((tabItem) => (
            <Link
              key={tabItem.id}
              href={`/workspaces/${wid}/agents/${aid}?tab=${tabItem.id}`}
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

      {/* Tab Content */}
      <div>
        {tab === "overview" && <OverviewTab agent={agent} />}
        {tab === "chat" && <ChatTab agent={agent} />}
        {tab === "appearance" && <AppearanceTab agent={agent} />}
        {tab === "settings" && <SettingsTab agent={agent} />}
        {tab === "widget" && <WidgetTab agent={agent} wid={wid} aid={aid} />}
      </div>
    </div>
  );
}
