import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IntegrationGridCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  footerIcon?: ReactNode;
  isBeta?: boolean;
  onClick?: () => void;
  className?: string;
  categories?: string[];
}

export default function IntegrationGridCard({
  title,
  description,
  icon,
  action,
  footerIcon,
  isBeta,
  onClick,
  className,
}: IntegrationGridCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-200 hover:shadow-sm cursor-pointer group bg-card hover:bg-muted/30 border rounded-xl overflow-hidden",
        className,
      )}
      onClick={onClick}
    >
      <div className="p-3 pb-0 flex items-center justify-between gap-3">
        <div className="p-1.5 bg-muted/50 rounded-lg group-hover:bg-background transition-colors shrink-0 border border-transparent group-hover:border-border/50">
          <div className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
            {icon}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm leading-none truncate">
                {title}
              </h3>
              {isBeta && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4 font-normal"
                >
                  Beta
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="px-3 pb-3 pt-0 flex items-center justify-between mt-auto">
        <div className="text-muted-foreground [&>svg]:w-3.5 [&>svg]:h-3.5">
          {footerIcon}
        </div>
        <div onClick={(e) => e.stopPropagation()}>{action}</div>
      </div>
    </div>
  );
}
