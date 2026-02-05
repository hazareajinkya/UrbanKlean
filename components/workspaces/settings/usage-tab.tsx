import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import { useCurrentUser } from "@/lib/hooks/user/use-user";

interface UsageTabProps {
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

export default function UsageTab({ wid }: UsageTabProps) {
  const { user } = useCurrentUser();
  const { data: usageData, isLoading: isUsageLoading } = useUsage(wid || "");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedUsageData =
    usageData && usageData.length
      ? [...usageData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];

  const totalPages = Math.ceil((sortedUsageData.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedUsageData.slice(startIndex, endIndex);

  const recurringRemaining = user?.credit?.recurring || 0;
  const purchasedRemaining = user?.credit?.purchased || 0;
  const totalCredits =
    (user?.subscription?.recurringQuota || 0) + purchasedRemaining;
  const remaining = recurringRemaining + purchasedRemaining;
  const used = totalCredits - remaining;
  const progressValue = totalCredits > 0 ? (used / totalCredits) * 100 : 0;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  return (
    <motion.div
      key="domains"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Usage History</CardTitle>
              <CardDescription>
                Detailed breakdown of your workspace usage
              </CardDescription>
            </div>
            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Usage</span>
                <span>{progressValue.toFixed(1)}%</span>
              </div>
              <Progress value={progressValue} className="mt-2 mb-1" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {used} / {totalCredits}
                </span>
                <span>{remaining} remaining</span>
              </div>
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
    </motion.div>
  );
}
