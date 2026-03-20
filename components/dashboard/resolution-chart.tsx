"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpCircle,
} from "lucide-react";

/** Shared with SentimentChart — positive/negative match resolved/unresolved slices */
export const resolutionChartPalette = {
  resolved: "hsl(142, 76%, 36%)",
  partiallyResolved: "hsl(45, 93%, 40%)",
  unresolved: "hsl(0, 72%, 51%)",
  escalated: "hsl(262, 83%, 50%)",
} as const;

interface ResolutionChartProps {
  resolution: {
    resolved: number;
    "partially-resolved": number;
    unresolved: number;
    escalated: number;
  };
}

export const ResolutionChart = ({ resolution }: ResolutionChartProps) => {
  const total = useMemo(() => {
    return (
      resolution.resolved +
      resolution["partially-resolved"] +
      resolution.unresolved +
      resolution.escalated
    );
  }, [resolution]);

  const chartData = useMemo(() => {
    if (total === 0) return [];

    return [
      {
        name: "Resolved",
        value: resolution.resolved,
        percentage: ((resolution.resolved / total) * 100).toFixed(1),
        colorKey: "resolved",
      },
      {
        name: "Partially Resolved",
        value: resolution["partially-resolved"],
        percentage: ((resolution["partially-resolved"] / total) * 100).toFixed(
          1,
        ),
        colorKey: "partially-resolved",
      },
      {
        name: "Unresolved",
        value: resolution.unresolved,
        percentage: ((resolution.unresolved / total) * 100).toFixed(1),
        colorKey: "unresolved",
      },
      {
        name: "Escalated",
        value: resolution.escalated,
        percentage: ((resolution.escalated / total) * 100).toFixed(1),
        colorKey: "escalated",
      },
    ].filter((item) => item.value > 0);
  }, [resolution, total]);

  const chartConfig = {
    resolved: {
      label: "Resolved",
      color: resolutionChartPalette.resolved,
    },
    "partially-resolved": {
      label: "Partially Resolved",
      color: resolutionChartPalette.partiallyResolved,
    },
    unresolved: {
      label: "Unresolved",
      color: resolutionChartPalette.unresolved,
    },
    escalated: {
      label: "Escalated",
      color: resolutionChartPalette.escalated,
    },
  };

  const resolutionRate = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((resolution.resolved / total) * 100);
  }, [resolution.resolved, total]);

  const stats = [
    {
      label: "Resolved",
      value: resolution.resolved,
      percentage: total > 0 ? (resolution.resolved / total) * 100 : 0,
      color: resolutionChartPalette.resolved,
      bgColor: "bg-green-600/10",
      icon: CheckCircle2,
    },
    {
      label: "Partial",
      value: resolution["partially-resolved"],
      percentage:
        total > 0 ? (resolution["partially-resolved"] / total) * 100 : 0,
      color: resolutionChartPalette.partiallyResolved,
      bgColor: "bg-yellow-600/10",
      icon: AlertCircle,
    },
    {
      label: "Unresolved",
      value: resolution.unresolved,
      percentage: total > 0 ? (resolution.unresolved / total) * 100 : 0,
      color: resolutionChartPalette.unresolved,
      bgColor: "bg-red-600/10",
      icon: XCircle,
    },
    {
      label: "Escalated",
      value: resolution.escalated,
      percentage: total > 0 ? (resolution.escalated / total) * 100 : 0,
      color: resolutionChartPalette.escalated,
      bgColor: "bg-purple-600/10",
      icon: ArrowUpCircle,
    },
  ];

  if (chartData.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resolution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-[140px] w-[140px] flex-col items-center justify-center">
              <span className="text-3xl font-semibold">0%</span>
              <span className="text-xs text-muted-foreground">resolved</span>
            </div>
            <div className="flex-1 space-y-2.5">
              {stats.map((stat) => (
                <div key={stat.label} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <stat.icon
                        className="h-3 w-3 shrink-0"
                        style={{ color: stat.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium tabular-nums">0</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: "0%", backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Resolution Status</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          {/* Donut Chart with Center Label */}
          <div className="relative shrink-0">
            <ChartContainer
              config={chartConfig}
              className="h-[140px] w-[140px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const percentage = props.payload?.percentage || "0";
                        return [
                          `${value} (${percentage}%)`,
                          props.payload?.name || name,
                        ];
                      }}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--color-${entry.colorKey})`}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 6}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {resolutionRate}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 12}
                              className="fill-muted-foreground text-[10px]"
                            >
                              resolved
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Stats with Progress Bars */}
          <div className="flex-1 space-y-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <stat.icon
                      className="h-3 w-3 shrink-0 transition-transform group-hover:scale-110"
                      style={{ color: stat.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    {stat.value}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
