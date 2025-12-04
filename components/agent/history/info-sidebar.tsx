"use client";

import { ISession } from "@/lib/types/session";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  User,
  Clock,
  MessageSquare,
  Copy,
} from "lucide-react";
import { useHistoryStore } from "@/lib/stores/history-store";
import { toast } from "sonner";

interface InfoSidebarProps {
  currentSession?: ISession;
  setcurrentSession: (session: ISession) => void;
  setSessionId: (sessionId: string) => void;
  sessions: ISession[];
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

export const InfoSidebar = ({
  setcurrentSession,
  currentSession,
  sessions,
  setSessionId,
}: InfoSidebarProps) => {
  const persons = useHistoryStore((state) => state.persons);
  const loadingSessionIds = useHistoryStore((state) => state.loadingSessionIds);

  if (!currentSession?.personId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground px-6">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
          <User className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-foreground/70">No Contact</p>
        <p className="text-xs text-center mt-1">Select a conversation</p>
      </div>
    );
  }

  const person = persons[currentSession.personId];

  if (!person) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="px-5 py-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-base flex-shrink-0">
            {person.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {person.name || "Unknown"}
            </h3>
            {hasWorkInfo && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
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
                  {tag}
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
          <div className="px-5 py-4 border-b border-border">
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
              {person.memories.slice(0, 5).map((memory, i) => (
                <p
                  key={i}
                  className="text-xs text-foreground/80 leading-relaxed"
                >
                  • {memory}
                </p>
              ))}
              {person.memories.length > 5 && (
                <p className="text-[10px] text-muted-foreground">
                  +{person.memories.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes (human notes) */}
        {hasNotes && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Notes</SectionLabel>
            <div className="space-y-2">
              {person.notes.slice(0, 3).map((note, i) => (
                <p
                  key={i}
                  className="text-xs text-foreground/80 leading-relaxed"
                >
                  {note}
                </p>
              ))}
              {person.notes.length > 3 && (
                <p className="text-[10px] text-muted-foreground">
                  +{person.notes.length - 3} more
                </p>
              )}
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
              {person.pastSessionIds.slice(0, 8).map((sessionId) => {
                const isCurrentSession = sessionId === currentSession.id;
                const session = sessions.find((s) => s.id === sessionId);
                const isLoading = loadingSessionIds.has(sessionId);

                return (
                  <button
                    key={sessionId}
                    onClick={() => {
                      if (isCurrentSession) return;
                      if (session) {
                        setcurrentSession(session);
                      } else {
                        // Just update URL - ChatHistoryTab will handle fetching
                        setSessionId(sessionId);
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                      isCurrentSession
                        ? "bg-primary/5 text-primary cursor-default"
                        : session || isLoading
                        ? "hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        : "text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="text-xs truncate flex-1">
                      {sessionId.slice(0, 16)}...
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        isCurrentSession ? "bg-primary/10" : "opacity-0"
                      }`}
                    >
                      Current
                    </span>
                  </button>
                );
              })}
              {person.pastSessionIds.length > 8 && (
                <p className="text-[10px] text-muted-foreground px-2 pt-1">
                  +{person.pastSessionIds.length - 8} more conversations
                </p>
              )}
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
          </span>
        </div>
      )}
    </div>
  );
};
