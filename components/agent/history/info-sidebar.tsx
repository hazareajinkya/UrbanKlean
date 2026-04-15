"use client";

import { useState } from "react";
import { ISession } from "@/lib/types/session";
import { formatDate, fromSlug } from "@/lib/utils";
import {
  Loader,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  User,
  Clock,
  MessageSquare,
  Copy,
  Link2,
  CreditCard,
  DollarSign,
  Coins,
  HandCoins,
  BadgeDollarSignIcon,
  CircleDollarSign,
  Code,
  type LucideIcon,
} from "lucide-react";
import { useHistoryStore } from "@/lib/stores/history-store";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useIdenticalPersons } from "@/lib/hooks/people/use-people";
import { getwid } from "@/lib/utils";
import { Users } from "lucide-react";
import SendTemplateModal from "./send-template-modal";
import { Button } from "@/components/ui/button";
import { WAIcon } from "@/lib/logos";

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

export const InfoSidebar = ({
  setcurrentSession,
  currentSession,
  sessions,
  setSessionId,
}: InfoSidebarProps) => {
  const persons = useHistoryStore((state) => state.persons);
  const loadingSessionIds = useHistoryStore((state) => state.loadingSessionIds);

  const wid = typeof window !== "undefined" ? getwid() : "";
  const { data: identicalPersons = [], isLoading: isLoadingIdenticalPersons } =
    useIdenticalPersons(wid, currentSession?.personId || "");

  if (!currentSession?.personId && !currentSession?.geo) {
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

  const person = currentSession.personId
    ? persons[currentSession.personId]
    : undefined;

  if (!person && !currentSession.geo) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasSessionInfo =
    currentSession &&
    (currentSession.geo?.city ||
      currentSession.usage?.credits ||
      currentSession.fromPage);
  const hasContactInfo =
    person &&
    (person.emails?.length > 0 ||
      person.phones?.length > 0 ||
      person.location ||
      person.title ||
      person.company ||
      person.name);
  const hasWorkInfo = person && (person.company || person.title);
  const hasTags = person && person.tags?.length > 0;
  const hasInterests = person && person.interests?.length > 0;
  const hasMemories = person && person.memories?.length > 0;
  const hasNotes = person && person.notes?.length > 0;
  const hasSummary = person && person.summary?.length > 0;
  // Filtered in store
  const filteredPastSessions = (person && person.pastSessionIds) || [];

  const hasPastSessions = filteredPastSessions.length > 0;
  const hasIdenticalPersons = identicalPersons && identicalPersons.length > 0;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="border-b h-14 flex items-center justify-between px-5 bg-muted w-full">
        <p className="text-sm text-foreground">{person?.name || "Unknown"}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Contact Info */}

        {hasSessionInfo && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>SESSION INFO</SectionLabel>
            <div className="space-y-1">
              {currentSession.geo?.city && (
                <CopyableItem
                  icon={MapPin}
                  value={`${currentSession.geo.city},  ${currentSession.geo.country}`}
                />
              )}
              {currentSession.usage?.credits && (
                <CopyableItem
                  icon={DollarSign}
                  value={`${currentSession.usage?.credits} messages used`}
                />
              )}
              {currentSession.fromPage && (
                <FromPageLink fromPage={currentSession.fromPage} />
              )}
            </div>
          </div>
        )}

        {person && (hasContactInfo || currentSession.fromPage) && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-1">
              {person?.name && <CopyableItem icon={User} value={person.name} />}
              {person.externalIds?.map((extId, i) => {
                if (person && person.metadata && person.metadata[extId.id]) {
                  return (
                    <CopyableItem
                      key={i}
                      icon={Link2}
                      value={`${extId.provider}: ${
                        person.metadata[extId.id].username?.[0]
                      }`}
                      mono
                    />
                  );
                }
              })}
              {person?.emails?.map((email, i) => (
                <CopyableItem key={i} icon={Mail} value={email.value} />
              ))}
              {person?.phones?.map((phone, i) => (
                <CopyableItem key={i} icon={Phone} value={phone.value} mono />
              ))}
              {person?.title && (
                <CopyableItem icon={Briefcase} value={person.title} />
              )}
              {person?.company && (
                <CopyableItem icon={Building2} value={person.company} />
              )}
            </div>
          </div>
        )}

        {/* Identical Persons */}
        {hasIdenticalPersons && (
          <div className="px-5 py-4 border-b border-border/30">
            <SectionLabel>
              Identical Contacts ({identicalPersons.length})
            </SectionLabel>
            <div className="space-y-1">
              {identicalPersons.slice(0, 5).map((identicalPerson) => {
                const identicalPersonName =
                  identicalPerson.name ||
                  identicalPerson.emails?.[0]?.value ||
                  `Person-${identicalPerson.id.slice(0, 8)}`;
                const identicalPersonSessions = sessions.filter(
                  (s) => s.personId === identicalPerson.id,
                );
                const hasIdenticalSessions = identicalPersonSessions.length > 0;

                return (
                  <button
                    key={identicalPerson.id}
                    onClick={() => {
                      if (hasIdenticalSessions) {
                        setcurrentSession(identicalPersonSessions[0]);
                      }
                    }}
                    disabled={!hasIdenticalSessions}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                      hasIdenticalSessions
                        ? "hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        : "text-muted-foreground/50 cursor-default"
                    }`}
                  >
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate flex-1">
                      {identicalPersonName}
                    </span>
                    {identicalPersonSessions.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {identicalPersonSessions.length}
                      </span>
                    )}
                  </button>
                );
              })}
              {identicalPersons.length > 5 && (
                <p className="text-[10px] text-muted-foreground px-2 pt-1">
                  +{identicalPersons.length - 5} more
                </p>
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

        {/* Summary */}
        {hasSummary && (
          <div className="px-5 py-4 border-b border-border">
            <SectionLabel>Summary</SectionLabel>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {person.summary}
            </p>
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
              Conversations ({filteredPastSessions.length})
            </SectionLabel>
            <div className="space-y-1">
              {filteredPastSessions.slice(0, 8).map((sessionItem) => {
                const sessionId = sessionItem.sid;
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
                      <Loader className="w-3 h-3 flex-shrink-0 animate-spin" />
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
              {filteredPastSessions.length > 8 && (
                <p className="text-[10px] text-muted-foreground px-2 pt-1">
                  +{filteredPastSessions.length - 8} more conversations
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {person && person.createdAt && (
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

const FromPageLink = ({ fromPage }: { fromPage: string }) => {
  const displayText = (() => {
    try {
      const url = new URL(fromPage);
      const pathname = url.pathname || "/";
      if (pathname === "/") {
        return url.hostname;
      }
      return pathname;
    } catch {
      return fromPage;
    }
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={fromPage}
          target="_blank"
          className="flex items-center gap-2.5 min-w-0 hover:bg-secondary/50 -mx-2 px-2 py-1 rounded-md transition-colors"
        >
          <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-foreground truncate flex-1">
            {displayText}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs break-all">{fromPage}</p>
      </TooltipContent>
    </Tooltip>
  );
};
