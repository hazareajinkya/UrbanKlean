"use client";

import { useMemo } from "react";
import { IAnalytics, IWorkspaceAnalyticsSummary } from "@/lib/types/analytics";
import { StatCard } from "./stat-card";
import { ConversationsChart } from "./conversations-chart";
import { PeakHoursCard } from "./peak-hours-card";
import { ResolutionChart } from "./resolution-chart";
import { SentimentChart } from "./sentiment-chart";
import {
  MessageSquare,
  Coins,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsDashboardProps {
  dailyAnalytics: IAnalytics[];
  summary: IWorkspaceAnalyticsSummary | null;
  isLoading?: boolean;
}

const emptySummary: IWorkspaceAnalyticsSummary = {
  totalConversations: 0,
  totalCreditsUsed: 0,
  totalCost: 0,
  resolution: {
    resolved: 0,
    "partially-resolved": 0,
    unresolved: 0,
    escalated: 0,
  },
  sentiment: {
    positive: 0,
    negative: 0,
    neutral: 0,
  },
  totalClosedConversations: 0,
  totalTokensUsed: 0,
  peakHours: [],
  avgCostPerConversation: 0,
  avgCreditsPerConversation: 0,
  lastUpdated: "",
};

export const AnalyticsDashboard = ({
  dailyAnalytics,
  summary,
  isLoading = false,
}: AnalyticsDashboardProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6  w-full">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-[320px] w-full lg:col-span-3" />
          <Skeleton className="h-[320px] w-full lg:col-span-2" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  const displaySummary = summary ?? emptySummary;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const resolutionRate = useMemo(() => {
    if (displaySummary.totalClosedConversations === 0) return "0";
    return (
      (displaySummary.resolution.resolved /
        displaySummary.totalClosedConversations) *
      100
    ).toFixed(1);
  }, [displaySummary.resolution, displaySummary.totalClosedConversations]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl">AI Overview</h1>
          <p className="text-sm text-muted-foreground">
            AI analytics and insights for your workspace
          </p>
        </div>
        {displaySummary.lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Updated{" "}
              {format(parseISO(displaySummary.lastUpdated), "MMM d, h:mm a")}
            </span>
          </div>
        )}
      </div>

      {/* Stat Cards - 4 columns on large screens */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Conversations"
          value={displaySummary.totalConversations}
          icon={MessageSquare}
          formatValue={formatNumber}
        />
        <StatCard
          title="Closed Conversations"
          value={displaySummary.totalClosedConversations}
          icon={CheckCircle2}
          formatValue={formatNumber}
        />
        <StatCard
          title="Credits Used"
          value={displaySummary.totalCreditsUsed}
          icon={Coins}
          formatValue={formatNumber}
        />
        <StatCard
          title="Total Cost"
          value={displaySummary.totalCost}
          icon={DollarSign}
          formatValue={formatCurrency}
        />
      </div>

      {/* Main Charts Row - Conversations + Peak Hours side by side */}
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ConversationsChart dailyAnalytics={dailyAnalytics} />
        </div>
        <div className="lg:col-span-2">
          <PeakHoursCard dailyAnalytics={dailyAnalytics} />
        </div>
      </div>

      {/* Resolution & Sentiment Row */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ResolutionChart resolution={displaySummary.resolution} />
        <SentimentChart sentiment={displaySummary.sentiment} />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 grid-cols-3">
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Cost / Conv"
          value={displaySummary.avgCostPerConversation}
          icon={DollarSign}
          formatValue={formatCurrency}
        />
        <StatCard
          title="Avg Credits / Conv"
          value={displaySummary.avgCreditsPerConversation}
          icon={Coins}
          formatValue={(v) => v.toFixed(2)}
        />
      </div>
    </div>
  );
};
