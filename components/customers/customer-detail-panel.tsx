"use client";

import { IFollowUpJob, IPerson } from "@/lib/types/person";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  User,
  Clock,
  Copy,
  Link2,
  Brain,
  FileText,
  MessageSquare,
  Pencil,
  X,
  CalendarClock,
  Repeat,
  Ban,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, fromSlug } from "@/lib/utils";
import { cronToReadableText } from "@/lib/utils/cron-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import FollowUpModal from "./follow-up-modal";
import useFollowUpActions from "@/lib/hooks/followup/use-followup-actions";
import { Badge } from "@/components/ui/badge";
import { isOnTesting } from "@/lib/services/schedule-service";

interface CustomerDetailPanelProps {
  person: IPerson | null;
  wid: string;
  hasWhatsapp: boolean;
  onEdit: (person: IPerson) => void;
  onClose?: () => void;
  onPersonUpdated?: (person: IPerson) => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">
    {children}
  </p>
);

const CopyableItem = ({
  icon: Icon,
  value,
  mono,
}: {
  icon: LucideIcon;
  value: string;
  mono?: boolean;
}) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div
      className="flex items-center gap-2.5 min-w-0 group cursor-pointer hover:bg-secondary/50 -mx-2 px-2 py-1 rounded-md transition-colors"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCopy()}
      aria-label={`Copy ${value}`}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span
        className={`text-xs text-foreground truncate flex-1 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
      <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

export default function CustomerDetailPanel({
  person,
  wid,
  hasWhatsapp,
  onEdit,
  onClose,
  onPersonUpdated,
}: CustomerDetailPanelProps) {
  const { cancelFollowUp } = useFollowUpActions({ wid });
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(
    null,
  );
  const [isFollowUpMutationPending, setIsFollowUpMutationPending] =
    useState(false);

  if (!person) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground px-6">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
          <User className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-foreground/70">
          No Customer Selected
        </p>
        <p className="text-xs text-center mt-1">
          Select a customer from the list to view details
        </p>
      </div>
    );
  }

  const hasContactInfo =
    person.emails?.length > 0 || person.phones?.length > 0 || person.location;
  const hasWorkInfo = person.company || person.title;
  const hasTags = person.tags?.length > 0;
  const hasInterests = person.interests?.length > 0;
  const hasMemories = person.memories?.length > 0;
  const hasNotes = person.notes?.length > 0;
  const hasSummary = person.summary?.length > 0;
  const getFollowUpScheduleText = (schedule: IFollowUpJob["schedule"]) => {
    if (schedule.type === "once") {
      return `${schedule.date} at ${schedule.time}`;
    }

    return cronToReadableText(schedule.cron);
  };
  const hasPastSessions =
    person.pastSessionIds && person.pastSessionIds.length > 0;
  const hasExternalIds = person.externalIds?.length > 0;
  const hasPhone = person.phones?.length > 0;
  const scheduleFollowUpDisabled = (!hasWhatsapp || !hasPhone) && !isOnTesting;
  const scheduleFollowUpTooltip =
    !hasWhatsapp && !isOnTesting
      ? "Add a WhatsApp channel to your workspace to schedule follow-ups."
      : !hasPhone
        ? "Add a phone number to schedule WhatsApp follow-ups."
        : null;
  const followUps = Array.isArray(person.followUp) ? person.followUp : [];
  const activeFollowUps = followUps.filter(
    (item) => item.status === "scheduled",
  );
  const historyFollowUps = followUps.filter(
    (item) => item.status !== "scheduled",
  );
  const editingFollowUp =
    followUps.find((item) => item.id === editingFollowUpId) ?? null;

  const handleCancelFollowUp = async (followUpId: string) => {
    const response = await cancelFollowUp.mutateAsync({
      personId: person.id,
      followUpId,
    });

    if (response?.person && onPersonUpdated) {
      onPersonUpdated(response.person as IPerson);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Panel Header */}
      <div className="h-10 border-b bg-muted/10 px-4 pr-2 flex items-center justify-between flex-shrink-0">
        <p className="text-sm font-medium text-foreground">Customer Details</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(person)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Edit customer"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer Info Header */}
      <div className="px-5 py-5 border-b border-border/50 flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-background shadow-sm flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="text-base bg-primary/10 text-primary font-medium">
              {getInitials(person.name || "Unknown")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-foreground">
              {person.name || "Unknown Customer"}
            </h3>
            {hasWorkInfo && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {person.title}
                {person.title && person.company && " · "}
                {person.company}
              </p>
            )}
          </div>
        </div>

        {person.phones?.length > 0 && (
          <>
            {" "}
            {scheduleFollowUpTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="inline-flex rounded-md"
                    aria-label={scheduleFollowUpTooltip}
                  >
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingFollowUpId(null);
                        setIsFollowUpModalOpen(true);
                      }}
                      disabled={scheduleFollowUpDisabled}
                      className="h-8"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Follow-up
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {scheduleFollowUpTooltip}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setEditingFollowUpId(null);
                  setIsFollowUpModalOpen(true);
                }}
                disabled={scheduleFollowUpDisabled}
                className="h-8"
              >
                <CalendarClock className="h-4 w-4" />
                Follow-up
              </Button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Contact Info */}
        {hasContactInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-1">
              {person.emails?.map((email, i) => (
                <CopyableItem key={i} icon={Mail} value={email.value} />
              ))}
              {person.phones?.map((phone, i) => (
                <CopyableItem key={i} icon={Phone} value={phone.value} mono />
              ))}
              {person.location && (
                <CopyableItem icon={MapPin} value={person.location} />
              )}
            </div>
          </div>
        )}

        {/* Work Info */}
        {hasWorkInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Work</SectionLabel>
            <div className="space-y-2.5">
              {person.title && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground">
                    {person.title}
                  </span>
                </div>
              )}
              {person.company && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground">
                    {person.company}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External IDs */}
        {hasExternalIds && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>External IDs</SectionLabel>
            <div className="space-y-1">
              {person.externalIds.map((extId, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 min-w-0 text-xs text-foreground"
                >
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="font-mono truncate flex-1">
                    {extId.provider}: {extId.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {fromSlug(tag)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {hasInterests && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Interests</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {person.interests.map((interest, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {hasSummary && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Summary</SectionLabel>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {person.summary}
            </p>
          </div>
        )}

        {/* Memories (AI insights) */}
        {hasMemories && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Insights</SectionLabel>
            <div className="space-y-2">
              {person.memories.map((memory, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Brain className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed flex-1">
                    {memory}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes (human notes) */}
        {hasNotes && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Notes</SectionLabel>
            <div className="space-y-2">
              {person.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed flex-1">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {hasPastSessions && (
          <div className="px-5 py-4">
            <SectionLabel>
              Conversations ({person.pastSessionIds.length})
            </SectionLabel>
            <div className="space-y-1">
              {person.pastSessionIds.map((sessionItem, i) => {
                const sessionId = sessionItem.sid;
                const aid = sessionItem.aid;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground font-mono"
                  >
                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate flex-1">
                      {aid ? `[${aid.substring(0, 4)}] ` : ""}
                      {sessionId}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {followUps.length > 0 && (
          <div className="px-5 py-4 border-t border-border/30">
            <SectionLabel>Active Follow-ups</SectionLabel>
            <div className="space-y-2">
              {activeFollowUps.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No active follow-ups.
                </p>
              )}
              {activeFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border/60 bg-muted/20 p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.type === "once" ? (
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <p className="text-xs text-foreground">
                        {item.template?.name || "No template"}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {getFollowUpScheduleText(item.schedule)}
                    {` · ${item.timezone}`}
                  </p>
                  {item.error && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {item.error}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => {
                        setEditingFollowUpId(item.id);
                        setIsFollowUpModalOpen(true);
                      }}
                      disabled={
                        item.status !== "scheduled" || isFollowUpMutationPending
                      }
                      aria-busy={
                        isFollowUpMutationPending &&
                        editingFollowUpId === item.id
                      }
                    >
                      {isFollowUpMutationPending &&
                      editingFollowUpId === item.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : null}
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => handleCancelFollowUp(item.id)}
                      disabled={
                        item.status !== "scheduled" ||
                        (cancelFollowUp.isPending &&
                          cancelFollowUp.variables?.followUpId === item.id)
                      }
                      aria-busy={
                        cancelFollowUp.isPending &&
                        cancelFollowUp.variables?.followUpId === item.id
                      }
                    >
                      {cancelFollowUp.isPending &&
                      cancelFollowUp.variables?.followUpId === item.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <Ban className="h-3.5 w-3.5" aria-hidden />
                      )}
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {historyFollowUps.length > 0 && (
              <div className="mt-4 space-y-2">
                <SectionLabel>Follow-up History</SectionLabel>
                {historyFollowUps.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-border/60 bg-muted/10 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.type === "once" ? (
                          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <p className="text-xs text-foreground">
                          {item.template?.name || "No template"}
                        </p>
                      </div>
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {getFollowUpScheduleText(item.schedule)}
                      {` · ${item.timezone}`}
                    </p>
                    {item.error && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {item.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {followUps.length === 0 && hasPhone && (
          <div className="px-5 py-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              No follow-ups scheduled yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {person.createdAt && (
        <div className="px-5 py-3 border-t border-border/30 flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">
            Added {formatDate(person.createdAt)}
            {person.updatedAt !== person.createdAt && (
              <> · Updated {formatDate(person.updatedAt)}</>
            )}
          </span>
        </div>
      )}

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        wid={wid}
        person={person}
        followUp={editingFollowUp}
        onMutationPendingChange={setIsFollowUpMutationPending}
        onSaved={(updatedPerson) => {
          if (onPersonUpdated) {
            onPersonUpdated(updatedPerson);
          }
        }}
      />
    </div>
  );
}
