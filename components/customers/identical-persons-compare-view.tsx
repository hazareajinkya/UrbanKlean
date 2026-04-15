"use client";

import { IPerson } from "@/lib/types/person";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate, fromSlug, cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Link2,
  CheckCircle2,
  Brain,
  FileText,
  MessageSquare,
  Merge,
  Clock,
  Tag,
  Sparkles,
  ArrowRight,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePeopleActions } from "@/lib/hooks/people/use-people-actions";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface IdenticalPersonsCompareViewProps {
  personA: IPerson;
  personB: IPerson;
  wid: string;
  onBack: () => void;
  onMergeComplete?: (mergedPerson: IPerson) => void;
  mergedPerson?: IPerson;
}

const getLastFourId = (id: string) => id.slice(-4);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">
    {children}
  </p>
);

const InfoRow = ({
  icon: Icon,
  value,
  mono = false,
}: {
  icon: LucideIcon;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    <span
      className={cn("text-xs text-foreground truncate", mono && "font-mono")}
    >
      {value}
    </span>
  </div>
);

const PersonPanel = ({
  person,
  label,
  variant = "default",
}: {
  person: IPerson;
  label: string;
  variant?: "default" | "success";
}) => {
  const hasContactInfo =
    person.emails?.length > 0 || person.phones?.length > 0 || person.location;
  const hasWorkInfo = person.company || person.title;
  const hasTags = person.tags?.length > 0;
  const hasInterests = person.interests?.length > 0;
  const hasMemories = person.memories?.length > 0;
  const hasNotes = person.notes?.length > 0;
  const hasSummary = person.summary?.length > 0;
  const hasPastSessions =
    person.pastSessionIds && person.pastSessionIds.length > 0;
  const hasExternalIds = person.externalIds?.length > 0;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-card rounded-xl border overflow-hidden",
        variant === "success" && "border-primary/40 ring-1 ring-primary/20"
      )}
    >
      {/* Panel Header */}
      <div
        className={cn(
          "h-10 border-b px-4 flex items-center justify-between shrink-0",
          variant === "success" ? "bg-primary/5" : "bg-muted/30"
        )}
      >
        <div className="flex items-center gap-2">
          {variant === "success" && (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          )}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono h-5">
          #{getLastFourId(person.id)}
        </Badge>
      </div>

      {/* Person Info Header */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-background shadow-sm shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="text-base bg-primary/10 text-primary font-medium">
              {getInitials(person.name || "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-foreground truncate">
              {person.name || "Unknown"}
            </h3>
            {hasWorkInfo && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {person.title}
                {person.title && person.company && " · "}
                {person.company}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Contact Info */}
        {hasContactInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-2">
              {person.emails?.map((email, i) => (
                <InfoRow key={i} icon={Mail} value={email.value} />
              ))}
              {person.phones?.map((phone, i) => (
                <InfoRow key={i} icon={Phone} value={phone.value} mono />
              ))}
              {person.location && (
                <InfoRow icon={MapPin} value={person.location} />
              )}
            </div>
          </div>
        )}

        {/* Work Info */}
        {hasWorkInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Work</SectionLabel>
            <div className="space-y-2">
              {person.title && (
                <InfoRow icon={Briefcase} value={person.title} />
              )}
              {person.company && (
                <InfoRow icon={Building2} value={person.company} />
              )}
            </div>
          </div>
        )}

        {/* External IDs */}
        {hasExternalIds && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>External IDs</SectionLabel>
            <div className="space-y-2">
              {person.externalIds.map((extId, i) => (
                <InfoRow
                  key={i}
                  icon={Link2}
                  value={`${extId.provider}: ${extId.id}`}
                  mono
                />
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
                  <Brain className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed flex-1">
                    {memory}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {hasNotes && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Notes</SectionLabel>
            <div className="space-y-2">
              {person.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
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
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>
              Conversations ({person.pastSessionIds.length})
            </SectionLabel>
            <div className="space-y-1">
              {person.pastSessionIds.slice(0, 5).map((sessionItem, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground font-mono"
                >
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  <span className="truncate flex-1">
                    {sessionItem.aid
                      ? `[${sessionItem.aid.substring(0, 4)}] `
                      : ""}
                    {sessionItem.sid}
                  </span>
                </div>
              ))}
              {person.pastSessionIds.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{person.pastSessionIds.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {person.createdAt && (
        <div className="px-5 py-3 border-t border-border/30 flex items-center gap-1.5 text-muted-foreground shrink-0">
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">
            Added {formatDate(person.createdAt)}
            {person.updatedAt !== person.createdAt && (
              <> · Updated {formatDate(person.updatedAt)}</>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const CompactPersonCard = ({ person }: { person: IPerson }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
    <Avatar className="h-9 w-9 border border-border/40 shrink-0">
      <AvatarImage src="" />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
        {getInitials(person.name || "?")}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-foreground truncate">
          {person.name || "Unknown"}
        </span>
        <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
          #{getLastFourId(person.id)}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
        {person.emails?.[0] && (
          <>
            <Mail className="w-3 h-3" />
            <span className="truncate">{person.emails[0].value}</span>
          </>
        )}
        {!person.emails?.[0] && person.phones?.[0] && (
          <>
            <Phone className="w-3 h-3" />
            <span className="truncate">{person.phones[0].value}</span>
          </>
        )}
      </div>
    </div>
  </div>
);

const OriginalPairPanel = ({
  personA,
  personB,
}: {
  personA: IPerson;
  personB: IPerson;
}) => (
  <div className="h-full flex flex-col bg-card rounded-xl border overflow-hidden">
    {/* Panel Header */}
    <div className="h-10 border-b bg-muted/30 px-4 flex items-center shrink-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Original Pair
      </p>
    </div>

    {/* Content */}
    <div className="flex-1 p-4 flex flex-col justify-center">
      <div className="space-y-3">
        <CompactPersonCard person={personA} />

        <div className="relative py-1">
          <div className="border-t border-dashed border-border" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
            <Merge className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>
        </div>

        <CompactPersonCard person={personB} />
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          These two profiles have been merged
        </p>
      </div>
    </div>
  </div>
);

export default function IdenticalPersonsCompareView({
  personA,
  personB,
  wid,
  onBack,
  onMergeComplete,
  mergedPerson,
}: IdenticalPersonsCompareViewProps) {
  // After merge: Original pair (left) | Merged result (right)
  if (mergedPerson) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            <OriginalPairPanel personA={personA} personB={personB} />
            <PersonPanel
              person={mergedPerson}
              label="Merged Result"
              variant="success"
            />
          </div>
        </div>

        <div className="border-t p-4 flex justify-end bg-card shrink-0">
          <Button onClick={onBack} className="min-w-[100px]">
            <CheckCircle2 className="w-4 h-4" />
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Before merge: Person A (left) | Person B (right)
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          <PersonPanel person={personA} label="Person A" />
          <PersonPanel person={personB} label="Person B" />
        </div>
      </div>
    </div>
  );
}
