import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime, exportUsageData } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarIcon, Download, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkspaceUsage } from "@/lib/hooks/usage/use-usage";
import { IUsage } from "@/lib/types/usage";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface UsageTabProps {
  wid?: string;
}

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
          {usage.metadata?.tokenUsage?.toLocaleString() ?? "0"}
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

export default function UsageTab({ wid }: UsageTabProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usageData, isLoading: isUsageLoading } = useWorkspaceUsage(
    wid || "",
    date,
  );

  useEffect(() => {
    if (isCalendarOpen) setTempDate(date);
  }, [isCalendarOpen, date]);

  const sortedUsageData =
    usageData && usageData.length
      ? [...usageData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      : [];

  const totalPages = Math.ceil(sortedUsageData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedUsageData.slice(startIndex, endIndex);

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleExport = () => exportUsageData(sortedUsageData, date);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  return (
    <motion.div
      key="usage"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
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
          ) : sortedUsageData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No usage data available</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-secondary sticky top-0 z-10 border-b">
                  <TableRow className="hover:bg-transparent border-b w-full">
                    <TableHead className="w-[200px] pl-6">Date & Time</TableHead>
                    <TableHead className="w-[150px]">Event Type</TableHead>
                    <TableHead className="w-[200px]">Model</TableHead>
                    <TableHead className="w-[150px]">Token Usage</TableHead>
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
