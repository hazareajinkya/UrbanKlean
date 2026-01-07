"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAnalytics } from "@/lib/types/analytics";
import { format, parse } from "date-fns";

interface ConversationsChartProps {
  dailyAnalytics: IAnalytics[];
}

const channelColors: Record<string, string> = {
  web: "hsl(221, 83%, 53%)", // Blue
  email: "hsl(142, 76%, 36%)", // Green
  whatsapp: "hsl(142, 71%, 45%)", // Green variant
  messenger: "hsl(262, 83%, 58%)", // Purple
  instagram: "hsl(340, 75%, 55%)", // Pink
  slack: "hsl(0, 0%, 20%)", // Dark gray
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
      <Card>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          7-Day Conversations by Channel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <defs>
              <linearGradient id="web" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.web}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.web}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="email" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.email}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.email}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="whatsapp" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.whatsapp}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.whatsapp}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="messenger" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.messenger}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.messenger}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="instagram" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.instagram}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.instagram}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="slack" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={channelColors.slack}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={channelColors.slack}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${value} `,
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="web"
              stackId="1"
              stroke={channelColors.web}
              fill="url(#web)"
            />
            <Area
              type="monotone"
              dataKey="email"
              stackId="1"
              stroke={channelColors.email}
              fill="url(#email)"
            />
            <Area
              type="monotone"
              dataKey="whatsapp"
              stackId="1"
              stroke={channelColors.whatsapp}
              fill="url(#whatsapp)"
            />
            <Area
              type="monotone"
              dataKey="messenger"
              stackId="1"
              stroke={channelColors.messenger}
              fill="url(#messenger)"
            />
            <Area
              type="monotone"
              dataKey="instagram"
              stackId="1"
              stroke={channelColors.instagram}
              fill="url(#instagram)"
            />
            <Area
              type="monotone"
              dataKey="slack"
              stackId="1"
              stroke={channelColors.slack}
              fill="url(#slack)"
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-bottom-1"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
