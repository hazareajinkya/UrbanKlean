"use client";

import Modal from "@/components/ui/modal";
import { IPerson } from "@/lib/types/person";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  User,
  Clock,
  Copy,
  Link2,
  Tag,
  Heart,
  Brain,
  FileText,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: IPerson | null;
  isLoading?: boolean;
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

export default function CustomerViewModal({
  isOpen,
  onClose,
  person,
  isLoading = false,
}: CustomerViewModalProps) {
  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        closeModal={onClose}
        size="2xl"
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border rounded-2xl p-6"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Modal>
    );
  }

  if (!person) {
    return (
      <Modal
        isOpen={isOpen}
        closeModal={onClose}
        size="2xl"
        className="max-w-2xl bg-card border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <p className="text-sm text-muted-foreground">
              No customer selected
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Modal>
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
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      size="2xl"
      className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <p className="text-sm text-muted-foreground">
            View all information about this customer
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {getInitials(person.name || "Unknown")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground truncate">
              {person.name || "Unknown Customer"}
            </h3>
            {hasWorkInfo && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {person.title}
                {person.title && person.company && " · "}
                {person.company}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {hasContactInfo && (
          <div>
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
          <div>
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
          <div>
            <SectionLabel>External IDs</SectionLabel>
            <div className="space-y-1">
              {person.externalIds.map((extId, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 min-w-0 text-xs text-foreground"
                >
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="font-mono">
                    {extId.provider}: {extId.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {hasInterests && (
          <div>
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
          <div>
            <SectionLabel>Summary</SectionLabel>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {person.summary}
            </p>
          </div>
        )}

        {/* Memories (AI insights) */}
        {hasMemories && (
          <div>
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
          <div>
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
          <div>
            <SectionLabel>
              Conversations ({person.pastSessionIds.length})
            </SectionLabel>
            <div className="space-y-1">
              {person.pastSessionIds.slice(0, 10).map((sessionId, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground font-mono"
                >
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate flex-1">{sessionId}</span>
                </div>
              ))}
              {person.pastSessionIds.length > 10 && (
                <p className="text-[10px] text-muted-foreground px-2 pt-1">
                  +{person.pastSessionIds.length - 10} more conversations
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {person.createdAt && (
          <div className="pt-4 border-t flex items-center gap-1.5 text-muted-foreground">
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
    </Modal>
  );
}
