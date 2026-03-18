"use client";

import { ReactNode } from "react";
import {
  AlertTriangle,
  Calculator,
  FileText,
  Heart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map icon names to actual icon components
const ICON_MAP = {
  AlertTriangle,
  Calculator,
  FileText,
  Heart,
  Sparkles,
} as const;

type IconName = keyof typeof ICON_MAP;

interface ToolPageLayoutProps {
  badge: string;
  badgeIcon: IconName;
  title: ReactNode;
  description: string;
  children: ReactNode;
  className?: string;
}

export const ToolPageLayout = ({
  badge,
  badgeIcon,
  title,
  description,
  children,
  className,
}: ToolPageLayoutProps) => {
  const BadgeIcon = ICON_MAP[badgeIcon];

  return (
    <div
      className={cn("w-full bg-background relative overflow-hidden", className)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      <div className="section-container border-x px-6 py-16 md:py-24">
        {/* Header / Intro Section */}
        <div className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border shadow-sm text-foreground text-sm font-medium">
            <BadgeIcon className="w-4 h-4 text-primary" />
            <span>{badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground tracking-tight">
            {title}
          </h1>
          <p className=" section-subline leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tool Content */}
        {children}
      </div>
    </div>
  );
};
