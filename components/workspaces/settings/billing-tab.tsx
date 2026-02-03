import React, { useMemo, useState } from "react";
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
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { PLANS } from "@/lib/plans";
import { capitalize, formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ChevronLeft,
  ChevronRight,
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
import { useUsage } from "@/lib/hooks/usage/use-usage";
import { IUsage } from "@/lib/types/usage";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionActions } from "@/lib/hooks/subscription/use-subscription-actions";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface BillingTabProps {
  wid?: string;
}

const ITEMS_PER_PAGE = 10;

const UsageTableRow = ({ usage }: { usage: IUsage }) => (
  <TableRow className="transition-colors hover:bg-muted/80">
    <TableCell className="pl-6 py-3">
      <span className="text-sm text-foreground">
        {formatDateTime(usage.createdAt)}
      </span>
    </TableCell>
    <TableCell>
      <Badge
        variant={usage.eventType === "chat_response" ? "default" : "secondary"}
        className="text-xs"
      >
        {usage.eventType === "chat_response" ? "Chat Response" : "Tool Call"}
      </Badge>
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
      <span className="text-sm font-medium text-foreground">
        {usage.amount.toLocaleString()}
      </span>
    </TableCell>
    <TableCell className="text-right pr-6">
      <span className="text-xs text-muted-foreground font-mono">
        {usage.sessionId?.slice(0, 8)}...
      </span>
    </TableCell>
  </TableRow>
);

export default function BillingTab({ wid }: BillingTabProps) {
  const { user } = useCurrentUser();
  const { data: usageData, isLoading: isUsageLoading } = useUsage(wid || "");
  console.log("usageData", usageData);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const {
    provider,
    manageSubscription,
    cancelSubscription,
    isManaging,
    isCanceling,
  } = useSubscriptionActions();

  const subscription = user?.subscription;

  const plan = PLANS[subscription?.planId as keyof typeof PLANS];
  const tier = plan?.tiers.find((t) => t.id === subscription?.tierId);

  const total = subscription?.recurringQuota || 0;
  const remaining = user?.credit?.recurring || 0;
  const used = total - remaining;
  const progressValue = (used / total) * 100;

  const tierMessages = Number(tier?.messages) / 1000;

  const sortedUsageData = useMemo(() => {
    if (!usageData || usageData.length === 0) return [];
    return [...usageData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [usageData]);

  const totalPages = Math.ceil((sortedUsageData.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = useMemo(
    () => sortedUsageData.slice(startIndex, endIndex),
    [sortedUsageData, startIndex, endIndex],
  );

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
    console.log("provider", provider);
    manageSubscription();
  };

  const handleCancelClick = () => {
    if (provider === "razorpay" || provider === "polar") {
      setShowCancelDialog(true);
    } else {
      // For Paddle, cancellation is handled in their portal
      manageSubscription();
    }
  };

  const handleCancelConfirm = () => {
    cancelSubscription(true); // Cancel at cycle end
    setShowCancelDialog(false);
  };

  return (
    <motion.div
      key="domains"
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
                <p className="text-muted-foreground text-xs">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <h1 className="text-2xl ">
                    {plan?.name} {tierMessages}k
                  </h1>
                  <span className="text-xs mt-0.5 border text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    {capitalize(subscription?.status ?? "")}
                  </span>
                </div>
              </div>

              <p className="text-lg font-medium">
                {" "}
                ${tier?.price?.usd || 0} / month
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between gap-2 ">
              <p className="text-sm text-muted-foreground">Usage</p>
              <p className="text-sm text-muted-foreground">{progressValue}%</p>
            </div>
            <Progress value={progressValue} className="mt-2 mb-2" />
            <div className="flex justify-between items-center gap-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {used} / {total}
              </p>
              <p className="text-sm text-muted-foreground">
                {remaining} remaining
              </p>
            </div>
          </CardContent>
          <CardFooter className="gap-2 justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Renews On</p>
              <p className="text-sm">{formatDate(subscription?.renewsAt)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleManageSubscription}
                disabled={isManaging || !provider}
              >
                <CreditCard className="w-4 h-4" />
                Manage Subscription
              </Button>
              {(provider === "razorpay" || provider === "polar") && (
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

        <Card className="w-[30%] dark">
          <CardHeader></CardHeader>
          <CardContent>
            <h1 className="text-center text-lg mb-1">Need more messages?</h1>
            <p className="text-center text-muted-foreground text-sm">
              Upgrade your plan or buy message credits to get more messages.
            </p>
          </CardContent>
          <CardFooter className="flex-col mt-2 gap-2">
            <Button variant="default" className="rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              Upgrade Plan
            </Button>
            <Button variant="outline" className="rounded-full">
              Buy Message Credits
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
            {plan?.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Check className="w-5 h-5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Usage History</CardTitle>
          <CardDescription>
            Detailed breakdown of your workspace usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsageLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sortedUsageData.length === 0 ? (
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
                    <TableHead className="w-[150px]">Event Type</TableHead>
                    <TableHead className="w-[200px]">Model</TableHead>
                    <TableHead className="w-[150px]">Token Usage</TableHead>
                    <TableHead className="w-[120px]">Amount</TableHead>
                    <TableHead className="w-[200px] text-right pr-6">
                      Session ID
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
                    {Math.min(endIndex, sortedUsageData.length)} of{" "}
                    {sortedUsageData.length} entries
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
                          if (page === 1 || page === totalPages) return true;
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
                                  currentPage === page ? "default" : "outline"
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
  );
}
