"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAnalytics } from "@/lib/types/analytics";
import { Clock } from "lucide-react";
import { format, parse } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PeakHoursCardProps {
  dailyAnalytics: IAnalytics[];
}

const timeSlots = [
  "00:00-04:00",
  "04:00-08:00",
  "08:00-12:00",
  "12:00-16:00",
  "16:00-20:00",
  "20:00-24:00",
];

export const PeakHoursCard = ({ dailyAnalytics }: PeakHoursCardProps) => {
  const { heatmapData, maxCount } = useMemo(() => {
    if (!dailyAnalytics || dailyAnalytics.length === 0) {
      return { heatmapData: [], maxCount: 0 };
    }

    // Sort daily analytics chronologically
    const sorted = [...dailyAnalytics].sort((a, b) => {
      const dateA = parse(a.date, "dd-MM-yyyy", new Date());
      const dateB = parse(b.date, "dd-MM-yyyy", new Date());
      return dateA.getTime() - dateB.getTime();
    });

    // Create heatmap data: 7 days × 6 time slots
    const data = sorted.map((day) => {
      const parsedDate = parse(day.date, "dd-MM-yyyy", new Date());
      const formattedDate = format(parsedDate, "dd MMM");
      
      // Create a map of period -> count for quick lookup
      const periodMap = new Map(
        day.peakHours.map((h) => [h.period, h.count])
      );

      // Get count for each time slot, defaulting to 0
      const slots = timeSlots.map((period) => ({
        period,
        count: periodMap.get(period) || 0,
      }));

      return {
        date: day.date,
        formattedDate,
        slots,
      };
    });

    // Find max count across all days and slots
    const max = Math.max(
      ...data.flatMap((day) => day.slots.map((s) => s.count)),
      1 // At least 1 to avoid division by zero
    );

    return { heatmapData: data, maxCount: max };
  }, [dailyAnalytics]);

  const getIntensity = (count: number) => {
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  };

  const getColor = (intensity: number) => {
    // Gradient from light blue (0%) to dark blue (100%)
    // Using opacity/lightness for gradient effect
    if (intensity === 0) {
      return "bg-blue-50 dark:bg-blue-950/20";
    }
    if (intensity < 20) {
      return "bg-blue-100 dark:bg-blue-900/30";
    }
    if (intensity < 40) {
      return "bg-blue-200 dark:bg-blue-800/40";
    }
    if (intensity < 60) {
      return "bg-blue-300 dark:bg-blue-700/50";
    }
    if (intensity < 80) {
      return "bg-blue-400 dark:bg-blue-600/60";
    }
    return "bg-blue-500 dark:bg-blue-500/70";
  };

  const getTextColor = (intensity: number) => {
    if (intensity < 50) {
      return "text-gray-700 dark:text-gray-300";
    }
    return "text-white";
  };

  if (heatmapData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Peak Hours (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] flex-col items-center justify-center gap-2">
            <span className="text-3xl font-semibold">0</span>
            <span className="text-sm text-muted-foreground">peak hours recorded</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Peak Hours (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {/* Header row with time slots */}
          <div className="grid grid-cols-7 gap-1.5">
            <div className="text-xs font-medium text-muted-foreground"></div>
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="text-[10px] text-muted-foreground text-center truncate"
                title={slot}
              >
                {slot.split("-")[0]}
              </div>
            ))}
          </div>

          {/* Data rows - one for each day */}
          <div className="space-y-1.5">
            {heatmapData.map((day) => (
              <div key={day.date} className="grid grid-cols-7 gap-1.5">
                {/* Date label */}
                <div className="text-xs font-medium text-muted-foreground flex items-center">
                  {day.formattedDate}
                </div>

                {/* Time slot cells */}
                {day.slots.map((slot) => {
                  const intensity = getIntensity(slot.count);
                  const bgColor = getColor(intensity);
                  const textColor = getTextColor(intensity);

                  return (
                    <Tooltip key={slot.period}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            ${bgColor} ${textColor}
                            rounded-md p-1.5 text-center
                            cursor-pointer transition-all hover:scale-105
                            border border-transparent hover:border-blue-400
                            min-h-[32px] flex items-center justify-center
                          `}
                        >
                          <span className="text-[10px] font-medium tabular-nums">
                            {slot.count > 0 ? slot.count : ""}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{day.formattedDate}</p>
                          <p>{slot.period}</p>
                          <p className="text-muted-foreground">
                            {slot.count} conversation{slot.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="flex-1 flex gap-0.5 h-3">
              {[0, 20, 40, 60, 80, 100].map((intensity) => (
                <div
                  key={intensity}
                  className={`flex-1 rounded ${getColor(intensity)}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

