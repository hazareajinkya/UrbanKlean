"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn, formatDate, getNextMonthFirstDay } from "@/lib/utils";
import { useCredits } from "@/lib/hooks/credits/use-credits";

export const CreditIndicator = () => {
  const { wid } = useParams() as { wid: string };
  const { data: creditsData, isLoading } = useCredits({ wid });
  const router = useRouter();

  if (isLoading || !creditsData?.user) return null;

  const { user, totals } = creditsData;
  const totalCredits = totals.totalCredits;
  const remainingCredits = totals.remainingCredits;
  const remainingPercentage =
    totals.remainingPercentage > 100 ? 100 : totals.remainingPercentage;

  const { colorClass, bgTrackClass, progressIndicatorClass, warningVariant } =
    (() => {
      const base = {
        colorClass: "text-emerald-500",
        bgTrackClass: "text-emerald-500/15",
        progressIndicatorClass:
          "[&>[data-slot=progress-indicator]]:bg-emerald-500",
        warningVariant: "none" as "none" | "low" | "critical",
      };

      if (remainingPercentage > 10) {
        return base;
      }

      if (remainingPercentage >= 2) {
        return {
          ...base,
          colorClass: "text-yellow-500",
          bgTrackClass: "text-yellow-500/15",
          progressIndicatorClass:
            "[&>[data-slot=progress-indicator]]:bg-yellow-500",
          warningVariant: "low",
        };
      }

      return {
        ...base,
        colorClass: "text-destructive",
        bgTrackClass: "text-destructive/15",
        progressIndicatorClass:
          "[&>[data-slot=progress-indicator]]:bg-destructive",
        warningVariant: "critical",
      };
    })();

  const handleBuyMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/pricing#extra-credits");
  };

  const renewalDate =
    user.subscription?.renewsAt ||
    user.subscription?.nextPaymentAt ||
    getNextMonthFirstDay();

  return (
    <HoverCard openDelay={150} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
          {warningVariant !== "none" && (
            <div
              className={cn(
                "flex items-center animate-in fade-in slide-in-from-left-2 duration-300 gap-2",
                warningVariant === "critical"
                  ? "text-destructive"
                  : "text-yellow-500",
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">
                {warningVariant === "critical"
                  ? "Credits are critically low"
                  : "Credits are running low"}
              </span>
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <span
              className={cn("text-lg font-medium tabular-nums", colorClass)}
            >
              {remainingCredits.toLocaleString()}
            </span>
            <CircularProgress
              value={remainingPercentage}
              size={24}
              strokeWidth={2}
              colorClass={colorClass}
              trackColorClass={bgTrackClass}
            />
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={10}
        className="w-[300px] p-0 z-50 rounded-2xl shadow-xl border-border overflow-hidden"
      >
        <div className="bg-card text-foreground p-6 ">
          <div>
            <h4 className="text-base font-medium">Monthly Credits</h4>
          </div>

          <div className="space-y-2.5 mt-2.5 mb-2.5">
            <div className="flex items-end justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="text-xl font-medium text-foreground">
                  {remainingCredits.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-1">
                  / {totalCredits.toLocaleString()} remaining
                </span>
              </p>
            </div>
            <Progress
              value={remainingPercentage}
              className={cn(
                "h-2 bg-black/10 dark:bg-white/10 mt-2",
                progressIndicatorClass,
              )}
            />
          </div>

          {warningVariant === "low" && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 mb-2.5">
              <p className="text-sm text-yellow-500 font-medium text-center">
                Credits are running low. Please top up soon.
              </p>
            </div>
          )}

          {warningVariant === "critical" && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 mb-2.5">
              <p className="text-sm text-destructive font-medium text-center">
                Credits are critically low. Top up to avoid disruptions.
              </p>
            </div>
          )}

          <Button
            className="w-full mt-2"
            onClick={handleBuyMore}
            aria-label="Buy more credits"
            tabIndex={0}
          >
            Buy More
          </Button>

          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Renews on {formatDate(renewalDate)}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
