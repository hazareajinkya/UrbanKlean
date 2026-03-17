"use client";

import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  className?: string;
  formatValue?: (value: number) => string;
  accentColor?: "blue" | "green" | "purple" | "orange";
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  formatValue,
  accentColor,
}: StatCardProps) => {
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const displayValue =
    typeof value === "number" && formatValue
      ? formatValue(value)
      : typeof value === "number"
        ? numericValue.toLocaleString()
        : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {title}
              </p>
              <motion.p
                className="mt-1.5 text-xl font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {displayValue}
              </motion.p>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
