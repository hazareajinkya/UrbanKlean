"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, Label } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentChartProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export const SentimentChart = ({ sentiment }: SentimentChartProps) => {
  const total = useMemo(() => {
    return sentiment.positive + sentiment.neutral + sentiment.negative;
  }, [sentiment]);

  const chartData = useMemo(() => {
    if (total === 0) return [];

    return [
      {
        name: "Positive",
        value: sentiment.positive,
        percentage: ((sentiment.positive / total) * 100).toFixed(1),
        colorKey: "positive",
      },
      {
        name: "Neutral",
        value: sentiment.neutral,
        percentage: ((sentiment.neutral / total) * 100).toFixed(1),
        colorKey: "neutral",
      },
      {
        name: "Negative",
        value: sentiment.negative,
        percentage: ((sentiment.negative / total) * 100).toFixed(1),
        colorKey: "negative",
      },
    ].filter((item) => item.value > 0);
  }, [sentiment, total]);

  const chartConfig = {
    positive: {
      label: "Positive",
      color: "hsl(152, 69%, 41%)",
    },
    neutral: {
      label: "Neutral",
      color: "hsl(215, 16%, 57%)",
    },
    negative: {
      label: "Negative",
      color: "hsl(4, 90%, 58%)",
    },
  };

  const dominantSentiment = useMemo(() => {
    if (total === 0) return { type: "neutral", percentage: 0 };
    
    const positive = sentiment.positive / total;
    const negative = sentiment.negative / total;
    const neutral = sentiment.neutral / total;

    if (positive >= negative && positive >= neutral) {
      return { type: "positive", percentage: Math.round(positive * 100) };
    }
    if (negative >= positive && negative >= neutral) {
      return { type: "negative", percentage: Math.round(negative * 100) };
    }
    return { type: "neutral", percentage: Math.round(neutral * 100) };
  }, [sentiment, total]);

  const stats = [
    {
      label: "Positive",
      value: sentiment.positive,
      percentage: total > 0 ? (sentiment.positive / total) * 100 : 0,
      color: "hsl(152, 69%, 41%)",
      icon: Smile,
      trendIcon: TrendingUp,
    },
    {
      label: "Neutral",
      value: sentiment.neutral,
      percentage: total > 0 ? (sentiment.neutral / total) * 100 : 0,
      color: "hsl(215, 16%, 57%)",
      icon: Meh,
      trendIcon: Minus,
    },
    {
      label: "Negative",
      value: sentiment.negative,
      percentage: total > 0 ? (sentiment.negative / total) * 100 : 0,
      color: "hsl(4, 90%, 58%)",
      icon: Frown,
      trendIcon: TrendingDown,
    },
  ];

  const getCenterIcon = () => {
    if (dominantSentiment.type === "positive") return "😊";
    if (dominantSentiment.type === "negative") return "😔";
    return "😐";
  };

  if (chartData.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          {/* Donut Chart with Emoji Center */}
          <div className="relative shrink-0">
            <ChartContainer config={chartConfig} className="h-[140px] w-[140px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const percentage = props.payload?.percentage || "0";
                        return [`${value} (${percentage}%)`, props.payload?.name || name];
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
                              y={(viewBox.cy || 0) - 4}
                              className="text-2xl"
                            >
                              {getCenterIcon()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-muted-foreground text-[10px]"
                            >
                              {total} total
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

          {/* Sentiment Stats Cards */}
          <div className="flex-1 space-y-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-xs font-semibold tabular-nums">
                      {stat.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium tabular-nums w-6 text-right">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
