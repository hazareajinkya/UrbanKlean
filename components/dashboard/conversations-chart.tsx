"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAnalytics } from "@/lib/types/analytics";
import { format, parse } from "date-fns";

interface ConversationsChartProps {
  dailyAnalytics: IAnalytics[];
}

const channelColors: Record<string, string> = {
  web: "var(--primary)",
  email: "#4285F4", // Gmail primary blue
  whatsapp: "#25D366", // WhatsApp primary green
  messenger: "#0084FF", // Messenger blue
  instagram: "#E1306C", // Instagram gradient red-pink
  slack: "#4A154B", // Slack aubergine (primary)
};

export const ConversationsChart = ({
  dailyAnalytics,
}: ConversationsChartProps) => {
  const chartData = useMemo(() => {
    if (!dailyAnalytics || dailyAnalytics.length === 0) return [];

    return dailyAnalytics
      .map((item) => {
        const parsedDate = parse(item.date, "dd-MM-yyyy", new Date());
        return {
          date: item.date,
          formattedDate: format(parsedDate, "dd MMM"),
          total: item.totalConversations,
          web: item.channel.web || 0,
          email: item.channel.email || 0,
          whatsapp: item.channel.whatsapp || 0,
          messenger: item.channel.messenger || 0,
          instagram: item.channel.instagram || 0,
          slack: item.channel.slack || 0,
        };
      })
      .sort((a, b) => {
        const dateA = parse(a.date, "dd-MM-yyyy", new Date());
        const dateB = parse(b.date, "dd-MM-yyyy", new Date());
        return dateA.getTime() - dateB.getTime();
      });
  }, [dailyAnalytics]);

  const chartConfig = {
    web: {
      label: "Web",
      color: channelColors.web,
    },
    email: {
      label: "Email",
      color: channelColors.email,
    },
    whatsapp: {
      label: "WhatsApp",
      color: channelColors.whatsapp,
    },
    messenger: {
      label: "Messenger",
      color: channelColors.messenger,
    },
    instagram: {
      label: "Instagram",
      color: channelColors.instagram,
    },
    slack: {
      label: "Slack",
      color: channelColors.slack,
    },
  };

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">
            7-Day Conversations by Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] flex-col items-center justify-center gap-2">
            <span className="text-3xl font-semibold">0</span>
            <span className="text-sm text-muted-foreground">conversations</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          7-Day Conversations by Channel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer
          config={chartConfig}
          className="h-[260px] w-full"
          aria-label="7-day conversations by channel stacked bar chart"
        >
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted/30"
            />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={35}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const filteredPayload = payload.filter(
                  (item) => item.value !== 0,
                );

                if (filteredPayload.length === 0) return null;

                return (
                  <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <div className="font-medium mb-1.5">Date: {label}</div>
                    <div className="grid gap-1">
                      {filteredPayload.map((item) => (
                        <div
                          key={item.dataKey}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${
                              item.dataKey === "web" ? "bg-primary" : ""
                            }`}
                            style={
                              item.dataKey !== "web"
                                ? {
                                    backgroundColor:
                                      chartConfig[
                                        item.dataKey as keyof typeof chartConfig
                                      ]?.color || item.color,
                                  }
                                : undefined
                            }
                          />
                          <span className="text-muted-foreground">
                            {chartConfig[
                              item.dataKey as keyof typeof chartConfig
                            ]?.label || item.dataKey}
                          </span>
                          <span className="ml-auto font-mono font-medium tabular-nums">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="web"
              stackId="1"
              fill={channelColors.web}
              radius={[0, 0, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="Web conversations"
            />
            <Bar
              dataKey="email"
              stackId="1"
              fill={channelColors.email}
              radius={[0, 0, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="Email conversations"
            />
            <Bar
              dataKey="whatsapp"
              stackId="1"
              fill={channelColors.whatsapp}
              radius={[0, 0, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="WhatsApp conversations"
            />
            <Bar
              dataKey="messenger"
              stackId="1"
              fill={channelColors.messenger}
              radius={[0, 0, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="Messenger conversations"
            />
            <Bar
              dataKey="instagram"
              stackId="1"
              fill={channelColors.instagram}
              radius={[0, 0, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="Instagram conversations"
            />
            <Bar
              dataKey="slack"
              stackId="1"
              fill={channelColors.slack}
              radius={[4, 4, 0, 0]}
              className="transition-opacity hover:opacity-80"
              aria-label="Slack conversations"
            />
          </BarChart>
        </ChartContainer>
        <div
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-3 border-t border-border/50"
          role="list"
          aria-label="Channel legend"
        >
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2" role="listitem">
              <span
                className={`h-3.5 w-3.5 rounded-sm shrink-0 ${
                  key === "web" ? "bg-primary" : ""
                }`}
                style={
                  key !== "web" ? { backgroundColor: config.color } : undefined
                }
                aria-hidden="true"
              />
              <span className="text-sm text-foreground font-medium">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
