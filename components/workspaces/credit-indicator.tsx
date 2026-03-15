"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useUser } from "@/lib/hooks/user/use-user";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn, formatDate } from "@/lib/utils";

export const CreditIndicator = () => {
  const { wid } = useParams() as { wid: string };
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace(wid);
  const ownerId = workspace?.ownerId ?? "";
  const { data: owner, isLoading: isOwnerLoading } = useUser(ownerId);
  const router = useRouter();

  if (isWorkspaceLoading || isOwnerLoading || !owner) return null;

  const recurringRemaining = Number(owner.credit?.recurring) || 0;
  const purchasedRemaining = Number(owner.credit?.purchased) || 0;
  const subscriptionQuota = Number(owner.subscription?.recurringQuota) || 0;

  const totalCredits = subscriptionQuota + purchasedRemaining;
  const remainingCredits = recurringRemaining + purchasedRemaining;
  const usedCredits = totalCredits - remainingCredits;

  let remainingPercentage = 0;
  if (totalCredits > 0) {
    remainingPercentage = (remainingCredits / totalCredits) * 100;
  }

  const usedPercentage = 100 - remainingPercentage;

  let colorClass = "text-emerald-500";
  let bgTrackClass = "text-emerald-500/15";
  let progressIndicatorClass =
    "[&>[data-slot=progress-indicator]]:bg-emerald-500";
  let isWarning = false;
  const isLowCredits = remainingCredits < 100;

  if (remainingPercentage <= 30 && remainingPercentage > 10) {
    colorClass = "text-yellow-500";
    bgTrackClass = "text-yellow-500/15";
    progressIndicatorClass = "[&>[data-slot=progress-indicator]]:bg-yellow-500";
  } else if (remainingPercentage <= 10) {
    colorClass = "text-destructive";
    bgTrackClass = "text-destructive/15";
    progressIndicatorClass =
      "[&>[data-slot=progress-indicator]]:bg-destructive";
    if (remainingPercentage <= 5) {
      isWarning = true;
    }
  }

  const handleBuyMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/billing");
  };

  const renewalDate =
    owner.subscription?.renewsAt || owner.subscription?.nextPaymentAt;

  const remainingPercentageStr = `${Math.round(remainingPercentage)}%`;
  let triggerTextSize = "text-[9px]";
  if (remainingPercentageStr.length >= 3) triggerTextSize = "text-[8px]";

  return (
    <HoverCard openDelay={150} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
          {isLowCredits && (
            <div className="flex items-center animate-in fade-in slide-in-from-left-2 duration-300 gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                Credits are running low
              </span>
            </div>
          )}
          <div className="relative">
            <CircularProgress
              value={remainingPercentage}
              size={36}
              strokeWidth={2.5}
              colorClass={colorClass}
              trackColorClass={bgTrackClass}
            >
              <span
                className={cn(
                  "font-medium tracking-tight text-xs leading-none",
                  triggerTextSize,
                  colorClass,
                )}
              >
                {remainingPercentageStr}
              </span>
            </CircularProgress>
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={10}
        className="w-[300px] p-0 z-50 rounded-2xl shadow-xl border-border overflow-hidden"
      >
        <div className="bg-card text-foreground p-6 space-y-2.5">
          <div>
            <h4 className="text-base font-medium">Monthly Credits</h4>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-end justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="text-xl font-medium text-foreground">
                  {usedCredits.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  /{totalCredits.toLocaleString()} used
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {remainingCredits.toLocaleString()} left
              </p>
            </div>
            <Progress
              value={usedPercentage}
              className={cn("h-2 bg-secondary", progressIndicatorClass)}
            />
          </div>

          {/* <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">
              {remainingCredits.toLocaleString()} credits left
            </span>
          </div> */}

          {renewalDate && (
            <div className="inline-flex items-center border border-border rounded-full px-3.5 py-1">
              <span className="text-xs text-muted-foreground">
                Renews on {formatDate(renewalDate)}
              </span>
            </div>
          )}

          {isWarning && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
              <p className="text-sm text-destructive font-medium text-center">
                Credits are critically low. Top up to avoid disruptions.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleBuyMore}
            aria-label="Buy more credits"
            tabIndex={0}
          >
            Buy More
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
