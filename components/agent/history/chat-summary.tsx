import { ISession } from "@/lib/types/session";
import { capitalize, fromSlug, getEmotionIcon } from "@/lib/utils";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Lightbulb,
  Shield,
  Tags,
  XCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ChatSummary = ({
  summary,
}: {
  summary: ISession["chatSummary"];
}) => {
  if (!summary) return null;

  return (
    <div className="shadow-[0_-2px_8px_2px_rgba(0,0,0,0.1)]">
      <Accordion type="single" collapsible className="w-full rounded-t-2xl">
        <AccordionItem value="summary" className="border-none rounded-t-2xl ">
          <AccordionTrigger className=" bg-card px-6 cursor-pointer py-4 hover:no-underline [&[data-state=open]>svg]:rotate-0 [&>svg]:rotate-180">
            <div className="flex flex-col gap-3 items-cnter w-full">
              <h4 className="text-base font-normal">
                {summary.title || "Chat Summary"}
              </h4>
              <div className="flex gap-2 items-center flex-wrap">
                {summary.resolutionStatus && (
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5",
                        getResolutionBadgeColor(summary.resolutionStatus)
                      )}
                    >
                      {summary.resolutionStatus === "resolved" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {summary.resolutionStatus === "resolved"
                        ? "Resolved"
                        : "Unresolved"}
                    </span>
                  </div>
                )}

                {summary.sentiment && (
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5",
                        getSentimentBadgeColor(summary.sentiment)
                      )}
                    >
                      {getEmotionIcon(summary.sentiment)}
                      {"   "}
                      {capitalize(summary.sentiment)}
                    </span>
                  </div>
                )}

                {summary.riskLevel && summary.riskLevel !== "none" && (
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5",
                        getRiskBadgeColor(summary.riskLevel)
                      )}
                    >
                      <Shield className="w-3 h-3" />
                      Risk: {capitalize(summary.riskLevel)}
                    </span>
                  </div>
                )}

                {summary.followUp && summary.followUp.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-400/20 dark:bg-blue-500/20">
                      <Flag className="w-3 h-3" />
                      Follow up Required
                    </span>
                  </div>
                )}

                {summary.isSuspicious && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 text-red-700 dark:text-red-400 bg-red-400/20 dark:bg-red-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Suspicious
                      {summary.suspiciousType &&
                        summary.suspiciousType !== "none" &&
                        ` (${summary.suspiciousType.replace("_", " ")})`}
                    </span>
                  </div>
                )}

                {summary.tags && summary.tags.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-muted "
                        >
                          <Tags className="w-3 h-3" />
                          {fromSlug(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {summary.customerIntent && (
                <div>
                  <p className="text-sm max-w-xl text-muted-foreground text-centr leading-relaxed font-normal">
                    {summary.customerIntent}
                  </p>
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent
            containerClassName="!overflow-y-auto max-h-[60vh]"
            className="border-t m0-0 bg-card px-6 pb-8"
          >
            <div className="mt-4 space-y-4 pb-4">
              {summary.followUp && summary.followUp.length > 0 && (
                <>
                  <SectionLabel>Follow Up</SectionLabel>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary.followUp}
                  </p>
                </>
              )}
              {summary.summary && (
                <>
                  <SectionLabel>Summary</SectionLabel>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary.summary}
                  </p>
                </>
              )}

              {summary.agentNotes && (
                <>
                  <SectionLabel>Agent Notes</SectionLabel>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary.agentNotes}
                  </p>
                </>
              )}
              {summary.insights && summary.insights.length > 0 && (
                <div>
                  <SectionLabel>Insights</SectionLabel>
                  <ul className="space-y-2 mt-2">
                    {summary.insights.map((insight, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground leading-relaxed"
                      >
                        <Lightbulb className="w-3.5 h-3.5  flex-shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const getResolutionBadgeColor = (status: string) => {
  return status === "resolved"
    ? "text-green-700 dark:text-green-400 bg-green-400/20 dark:bg-green-500/20"
    : "text-orange-700 dark:text-orange-400 bg-orange-400/20 dark:bg-orange-500/20";
};

const getSentimentBadgeColor = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "text-green-700 dark:text-green-400 bg-green-400/20 dark:bg-green-500/20";
    case "negative":
      return "text-red-700 dark:text-red-400 bg-red-400/20 dark:bg-red-500/20";
    default:
      return "text-muted-foreground bg-muted-foreground/10";
  }
};

const getRiskBadgeColor = (risk: string) => {
  switch (risk) {
    case "critical":
      return "text-red-700 dark:text-red-400 bg-red-400/20 dark:bg-red-500/20";
    case "high":
      return "text-orange-700 dark:text-orange-400 bg-orange-400/20 dark:bg-orange-500/20";
    case "medium":
      return "text-yellow-700 dark:text-yellow-400 bg-yellow-400/20 dark:bg-yellow-500/20";
    case "low":
      return "text-blue-700 dark:text-blue-400 bg-blue-400/20 dark:bg-blue-500/20";
    default:
      return "text-muted-foreground bg-muted-foreground/10";
  }
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-wider text-foreground mb-1">
    {children}
  </p>
);
