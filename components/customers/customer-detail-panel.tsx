"use client";

import { IPerson } from "@/lib/types/person";
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
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, fromSlug } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomerDetailPanelProps {
  person: IPerson | null;
  onEdit: (person: IPerson) => void;
  onClose?: () => void;
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
  icon: React.ElementType;
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
  onEdit,
  onClose,
}: CustomerDetailPanelProps) {
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
  const hasPastSessions =
    person.pastSessionIds && person.pastSessionIds.length > 0;
  const hasExternalIds = person.externalIds?.length > 0;

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
      <div className="px-5 py-5 border-b border-border/50">
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Contact Info */}
        {hasContactInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-1">
              {person.emails?.map((email, i) => (
                <CopyableItem key={i} icon={Mail} value={email} />
              ))}
              {person.phones?.map((phone, i) => (
                <CopyableItem key={i} icon={Phone} value={phone} mono />
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
    </div>
  );
}
