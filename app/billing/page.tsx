"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUser, userKey } from "@/lib/hooks/user/use-user";
import type { IUserSubscription } from "@/lib/types/user";
import { PLANS } from "@/lib/plans";
import { capitalize, formatDate, formatDateTime } from "@/lib/utils";
import {
  CalendarIcon,
  X,
  ArrowUpRight,
  Check,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsage, useGlobalUsage } from "@/lib/hooks/usage/use-usage";
import { IUsage } from "@/lib/types/usage";
import { useCredits } from "@/lib/hooks/credits/use-credits";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspacesNavbar } from "@/components/workspaces/workspace-navbar";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useSubscriptionActions } from "@/lib/hooks/subscription/use-subscription-actions";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;

const UsageTableRow = ({ usage }: { usage: IUsage }) => {
  const isCreditPurchase = usage.eventType === "credit_purchase";
  return (
    <TableRow className="transition-colors hover:bg-muted/80">
      <TableCell className="pl-6 py-3">
        <span className="text-sm text-foreground">
          {formatDateTime(usage.createdAt)}
        </span>
      </TableCell>
      <TableCell>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            isCreditPurchase && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {usage.eventType === "chat_response"
            ? "Chat Response"
            : usage.eventType === "tool_call"
              ? "Tool Call"
              : usage.eventType === "credit_purchase"
                ? "Credit Purchase"
                : usage.eventType === "credit_renewal"
                  ? "Credit Renewal"
                  : "Unknown"}
        </p>
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground">
          {usage.metadata?.model || "N/A"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {usage.metadata?.tokenUsage.toLocaleString()}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            isCreditPurchase && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {usage.amount.toLocaleString()}
        </span>
      </TableCell>
      <TableCell className="text-right pr-6">
        <span className="text-xs text-muted-foreground font-mono">
          {usage.aid?.slice(0, 8) || "N/A"}...
        </span>
      </TableCell>
    </TableRow>
  );
};

export default function BillingPage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const {
    provider,
    manageSubscription,
    cancelSubscription,
    isManaging,
    isCanceling,
  } = useSubscriptionActions();

  useEffect(() => {
    if (isCalendarOpen) {
      setTempDate(date);
    }
  }, [isCalendarOpen, date]);

  const { data: usageData, isLoading: isUsageLoading } = useGlobalUsage(date);
  const { data: creditsData } = useCredits({ userEmail: user?.email });
  const [currentPage, setCurrentPage] = useState(1);

  const subscription = user?.subscription;
  const subscriptionStatus = subscription?.status ?? "none";
  const hasActiveSubscription =
    subscriptionStatus !== "none" &&
    subscriptionStatus !== "canceled" &&
    subscriptionStatus !== "past_due";
  const isPastDue = subscriptionStatus === "past_due";
  const isCanceled = subscriptionStatus === "canceled";
  const isCancelingAtPeriodEnd = !!subscription?.canceledAtPeriodEnd;
  const isRazorpay =
    subscription?.razorpayPlanId && subscription.razorpayPlanId !== "";

  const plan = subscription?.planId
    ? PLANS[subscription.planId as keyof typeof PLANS]
    : null;
  const tier = plan?.tiers.find((t) => t.id === subscription?.tierId);
  const planName = plan?.name ?? "No Plan";
  const planFeatures = plan?.features ?? PLANS.all_in_one.features;
  const billingCycle = tier?.billingCycle ?? "monthly";
  const isAnnual = billingCycle === "annually";
  const isLifetime = billingCycle === "lifetime";
  const price = isRazorpay ? tier?.price?.inr || 0 : tier?.price?.usd || 0;
  const currencySymbol = isRazorpay ? "₹" : "$";
  const formatPrice = (value: number) =>
    value.toLocaleString(isRazorpay ? "en-IN" : "en-US", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    });
  const monthlyEquivalent = isAnnual ? price / 12 : 0;
  const monthlyEquivalentLabel =
    isAnnual && price
      ? `${currencySymbol}${formatPrice(monthlyEquivalent)} / month`
      : "";
  const renewInfo = getRenewInfo(subscription);

  const totalCredits = creditsData?.totals.totalCredits || 0;
  const remaining = creditsData?.totals.remainingCredits || 0;
  const used = creditsData?.totals.usedCredits || 0;
  const remainingPercentage = creditsData?.totals.remainingPercentage ?? 0;
  const progressValue = remainingPercentage > 100 ? 100 : remainingPercentage;

  const tierMessages = tier?.messages ? Number(tier.messages) / 1000 : 0;

  const totalPages = Math.ceil((usageData?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = (usageData || []).slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleManageSubscription = () => {
    manageSubscription();
  };

  const handleCancelClick = () => {
    if (provider === "razorpay" || provider === "polar") {
      setShowCancelDialog(true);
    } else {
      manageSubscription();
    }
  };

  const handleCancelConfirm = async () => {
    let cancelAtCycleEnd = true;
    if (isRazorpay && subscriptionStatus === "trialing") {
      cancelAtCycleEnd = false;
    }
    await cancelSubscription({ cancelAtCycleEnd });
    setTimeout(() => {
      refetchUser();
    }, 2000);
    setShowCancelDialog(false);
  };

  const qc = useQueryClient();

  const refetchUser = () => {
    if (!user?.email) return;
    qc.invalidateQueries({ queryKey: userKey(user.email) });
  };

  const handleStartSubscription = () => {
    const billingCycle = tier?.billingCycle ?? "annually";
    router.push(
      `/pricing?plan=all_in_one&tier=10000&billingCycle=${billingCycle}`,
    );
  };

  const handleBuyCredits = () => {
    router.push("/pricing#extra-credits");
  };

  const handlePrimaryAction = () => {
    if (hasActiveSubscription) {
      handleBuyCredits();
      return;
    }
    if (isPastDue) {
      manageSubscription();
      return;
    }
    handleStartSubscription();
  };

  const handleExport = () => {
    exportUsageData(usageData || [], date);
  };

  return (
    <>
      <WorkspacesNavbar />
      <div className="mt-24 max-w-7xl mx-auto px-4 pr-2 md:px-3 lg:px-3">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h1 className="text-xl">Billing</h1>
              <p className="text-muted-foreground text-sm">
                Manage your workspace billing and subscription.
              </p>
            </div>

            <div className="flex gap-4">
              <Card className="w-[70%] ">
                <CardHeader>
                  <div className="flex items-center gap-2 w-full justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Current Plan
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <h1 className="text-2xl ">
                          {planName} {tierMessages ? `${tierMessages}k` : ""}
                        </h1>
                        <span className="text-xs mt-0.5 border text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                          {capitalize(subscription?.status ?? "")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {`${currencySymbol}${formatPrice(price)} / ${
                          isAnnual ? "year" : isLifetime ? "lifetime" : "month"
                        }`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {`Billed ${
                          isAnnual
                            ? "annually"
                            : isLifetime
                              ? "once"
                              : "monthly"
                        }`}
                        {monthlyEquivalentLabel
                          ? ` • ${monthlyEquivalentLabel}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between gap-2 ">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-sm text-muted-foreground">
                      {progressValue.toFixed(1)}%
                    </p>
                  </div>
                  <Progress value={progressValue} className="mt-2 mb-2" />
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {remaining} / {totalCredits} remaining
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2 justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {renewInfo.label}
                    </p>
                    <p className="text-sm">{renewInfo.value}</p>
                  </div>
                  <div className="flex gap-2">
                    {!isRazorpay && (
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={handleManageSubscription}
                        disabled={isManaging || !provider}
                      >
                        {isManaging ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Manage Subscription
                      </Button>
                    )}
                    {(provider === "razorpay" || provider === "polar") &&
                      !isCancelingAtPeriodEnd && (
                        <Button
                          variant="outline"
                          className="text-destructive rounded-full"
                          onClick={handleCancelClick}
                          disabled={isCanceling}
                        >
                          Cancel
                        </Button>
                      )}
                  </div>
                </CardFooter>
              </Card>

              <Card className="w-[30%] dark flex flex-col items-center justify-center text-center">
                <CardContent className="flex flex-col items-center text-center">
                  <h1 className="text-lg mb-1">
                    {getSubscriptionTitle({
                      hasActiveSubscription,
                      isPastDue,
                      isCanceled,
                    })}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {getSubscriptionSubtitle({
                      hasActiveSubscription,
                      isPastDue,
                      isCanceled,
                    })}
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-center mt-1 gap-1">
                  <Button
                    variant="default"
                    className="rounded-full"
                    onClick={handlePrimaryAction}
                  >
                    {!hasActiveSubscription && (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                    {getPrimaryButtonLabel({
                      hasActiveSubscription,
                      isPastDue,
                      isCanceled,
                    })}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg ">Features Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planFeatures.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="w-5 h-5 shrink-0" />
                      <span>{feature.label}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={feature.tooltip}
                            className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={6}>
                          {feature.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Usage History</CardTitle>
                    <CardDescription>
                      Detailed breakdown of your workspace usage
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {date && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="h-8 px-2 lg:px-3 font-normal"
                        disabled={!usageData || usageData.length === 0}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Export
                      </Button>
                    )}
                    {date && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(undefined)}
                        className="h-8 px-2 lg:px-3 font-normal"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reset
                      </Button>
                    )}
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={tempDate?.from}
                          selected={tempDate}
                          onSelect={setTempDate}
                          numberOfMonths={2}
                        />
                        <div className="p-3 border-t flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setDate(tempDate);
                              setIsCalendarOpen(false);
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isUsageLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (usageData?.length || 0) === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No usage data available</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader className="bg-secondary sticky top-0 z-10 border-b">
                        <TableRow className="hover:bg-transparent border-b w-full">
                          <TableHead className="w-[200px] pl-6">
                            Date & Time
                          </TableHead>
                          <TableHead className="w-[150px]">
                            Event Type
                          </TableHead>
                          <TableHead className="w-[200px]">Model</TableHead>
                          <TableHead className="w-[150px]">
                            Token Usage
                          </TableHead>
                          <TableHead className="w-[120px]">Amount</TableHead>
                          <TableHead className="w-[200px] text-right pr-6">
                            Agent ID
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((usage: IUsage) => (
                          <UsageTableRow key={usage.id} usage={usage} />
                        ))}
                      </TableBody>
                    </Table>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, usageData?.length || 0)} of{" "}
                          {usageData?.length || 0} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                if (totalPages <= 7) return true;
                                if (page === 1 || page === totalPages)
                                  return true;
                                if (
                                  page >= currentPage - 1 &&
                                  page <= currentPage + 1
                                )
                                  return true;
                                return false;
                              })
                              .map((page, index, array) => {
                                const showEllipsis =
                                  index > 0 && page - array[index - 1] > 1;
                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsis && (
                                      <span className="px-2 text-muted-foreground">
                                        ...
                                      </span>
                                    )}
                                    <Button
                                      variant={
                                        currentPage === page
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => handlePageChange(page)}
                                      className="h-8 w-8 p-0"
                                    >
                                      {page}
                                    </Button>
                                  </React.Fragment>
                                );
                              })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <ConfirmationDialog
              isOpen={showCancelDialog}
              onClose={() => setShowCancelDialog(false)}
              onConfirm={handleCancelConfirm}
              title="Cancel Subscription"
              description="Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period."
              warningMessage="You will lose access to premium features at the end of your billing cycle."
              confirmText="Cancel Subscription"
              cancelText="Keep Subscription"
              isLoading={isCanceling}
              variant="destructive"
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

const exportUsageData = (usageData: IUsage[], dateRange?: DateRange) => {
  if (!usageData || usageData.length === 0) return;

  const headers = [
    "Date",
    "Event Type",
    "Model",
    "Token Usage",
    "Amount",
    "Agent ID",
    "Session ID",
  ];

  const csvContent = [
    headers.join(","),
    ...usageData.map((usage) =>
      [
        `"${formatDateTime(usage.createdAt)}"`,
        `"${usage.eventType}"`,
        `"${usage.metadata?.model || "N/A"}"`,
        usage.metadata?.tokenUsage.toLocaleString() || "0",
        usage.amount,
        `"${usage.aid}"`,
        `"${usage.sessionId}"`,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);

  const dateStr = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}-to-${format(
          dateRange.to,
          "yyyy-MM-dd",
        )}`
      : `${format(dateRange.from, "yyyy-MM-dd")}`
    : "all_time";

  link.setAttribute("download", `usage-history-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function getSubscriptionTitle(args: {
  hasActiveSubscription: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
}) {
  if (args.hasActiveSubscription) return "Need more messages?";
  if (args.isPastDue) return "Payment Issue";
  if (args.isCanceled) return "Subscription Canceled";
  return "Get Started";
}

function getSubscriptionSubtitle(args: {
  hasActiveSubscription: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
}) {
  if (args.hasActiveSubscription)
    return "Top up anytime with extra message credits.";
  if (args.isPastDue) return "Your payment is past due. Update it to continue.";
  if (args.isCanceled)
    return "Restart your subscription to get monthly messages.";
  return "Start your subscription to unlock monthly messages.";
}

function getPrimaryButtonLabel(args: {
  hasActiveSubscription: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
}) {
  if (args.hasActiveSubscription) return "Buy Message Credits";
  if (args.isPastDue) return "Update Payment";
  if (args.isCanceled) return "Restart Subscription";
  return "Start Subscription";
}

function getRenewInfo(subscription?: IUserSubscription) {
  if (
    (subscription?.status === "active" ||
      subscription?.status === "trialing") &&
    subscription.canceledAtPeriodEnd
  ) {
    return {
      label: "Cancels On",
      value: subscription.renewsAt
        ? formatDate(subscription.renewsAt)
        : subscription.nextPaymentAt
          ? formatDate(subscription.nextPaymentAt)
          : "—",
    };
  }
  if (subscription?.status === "canceled") {
    return {
      label: "Canceled On",
      value: subscription.canceledAt
        ? formatDate(subscription.canceledAt)
        : subscription.renewsAt
          ? formatDate(subscription.renewsAt)
          : "—",
    };
  }
  if (subscription?.status === "trialing") {
    return {
      label: "Trial Ends",
      value: subscription.trialEndsAt
        ? formatDate(subscription.trialEndsAt)
        : subscription.renewsAt
          ? formatDate(subscription.renewsAt)
          : "—",
    };
  }
  if (subscription?.status === "past_due") {
    return {
      label: "Payment Due",
      value: subscription.nextPaymentAt
        ? formatDate(subscription.nextPaymentAt)
        : subscription.renewsAt
          ? formatDate(subscription.renewsAt)
          : "—",
    };
  }
  if (subscription?.status === "paused") {
    return {
      label: "Paused On",
      value: subscription.canceledAt
        ? formatDate(subscription.canceledAt)
        : subscription.renewsAt
          ? formatDate(subscription.renewsAt)
          : "—",
    };
  }
  return {
    label: "Renews On",
    value: subscription?.renewsAt ? formatDate(subscription.renewsAt) : "—",
  };
}
