"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  renderLabel?: (progress: number) => number | string;
  size?: number;
  strokeWidth?: number;
  circleStrokeWidth?: number;
  progressStrokeWidth?: number;
  shape?: "square" | "round";
  progressClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  colorClass?: string;
  trackColorClass?: string;
  children?: React.ReactNode;
}

export const CircularProgress = ({
  value,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  showLabel,
  shape = "round",
  size = 24,
  strokeWidth,
  circleStrokeWidth = 3,
  progressStrokeWidth = 3,
  colorClass,
  trackColorClass,
  children,
  ...props
}: CircularProgressProps) => {
  const radius =
    size / 2 -
    (strokeWidth ?? Math.max(circleStrokeWidth, progressStrokeWidth));
  const circumference = Math.ceil(Math.PI * radius * 2);
  const offset = Math.ceil(circumference * ((100 - value) / 100));

  const pad =
    (strokeWidth ?? Math.max(circleStrokeWidth, progressStrokeWidth)) / 2;
  const viewBox = `${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`;

  // Support legacy colorClass / trackColorClass props
  const trackClass = trackColorClass || cn("stroke-primary/25", className);
  const progressClass = colorClass || cn("stroke-primary", progressClassName);
  const useLegacyColors = !!(colorClass || trackColorClass);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        !useLegacyColors && undefined,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="absolute inset-0 w-full h-full z-0"
        style={{ transform: "rotate(-90deg)" }}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base Circle / Track */}
        <circle
          className={
            useLegacyColors
              ? trackColorClass
              : cn("stroke-primary/25", className)
          }
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={useLegacyColors ? "currentColor" : undefined}
          strokeDasharray={circumference}
          strokeDashoffset="0"
          strokeWidth={strokeWidth ?? circleStrokeWidth}
        />

        {/* Progress */}
        <circle
          className={cn(
            "transition-all duration-300 ease-in-out",
            useLegacyColors
              ? colorClass
              : cn("stroke-primary", progressClassName),
          )}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={useLegacyColors ? "currentColor" : undefined}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap={shape}
          strokeWidth={strokeWidth ?? progressStrokeWidth}
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-md z-10",
            labelClassName,
          )}
        >
          {renderLabel ? renderLabel(value) : value}
        </div>
      )}

      {/* Children (legacy support for CreditIndicator etc.) */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {children}
        </div>
      )}
    </div>
  );
};
