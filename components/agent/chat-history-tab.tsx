"use client";

import { IAgent } from "@/lib/types/agent";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { ISession } from "@/lib/types/session";
import chatService from "@/lib/services/chat-service";
import { formatDate, getContrastingColor } from "@/lib/utils";
import clsx from "clsx";
import { UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { useHistoryStore } from "@/lib/stores/history-store";
import { Globe, Loader2, MailIcon, User } from "lucide-react";
import { InstagramIcon, MessengerIcon, SlackLogo, WAIcon } from "@/lib/logos";
import { IPerson } from "@/lib/types/person";
import { useSearchParams } from "next/navigation";

interface ChatHistoryTabProps {
  agent: IAgent;
}

export default function ChatHistoryTab({ agent }: ChatHistoryTabProps) {
  const [sessions, setsessions] = useState<ISession[]>();
  const [currentSession, setcurrentSession] = useState<ISession>();

  const searchParams = useSearchParams();

  const history = useHistoryStore((state) => state.history);
  const subscribeToHistory = useHistoryStore(
    (state) => state.subscribeToSessions
  );
  const unsubscribeHistory = useHistoryStore(
    (state) => state.unsubscribeFromSessions
  );

  useEffect(() => {
    subscribeToHistory(agent.id);

    return () => unsubscribeHistory();
  }, [agent.id]);

  return (
    <div>
      <div className="grid bg-white grid-cols-[1fr_2fr_1fr] border rounded-xl h-[80vh] overflow-hidden">
        {/* Chats Sidebar */}
        <div className="p-0 border-r overflow-y-auto" id="scrollableDiv">
          <SessionList
            agent={agent}
            sessions={history ?? []}
            currentSession={currentSession}
            setcurrentSession={setcurrentSession}
          />
        </div>

        {/* Chat Content */}
        <div className="p-0 overflow-y-auto">
          <HistoryMessageList agent={agent} currentSession={currentSession} />
        </div>

        {/* User Info Sidebar */}
        <div className="p-4 border-l">
          <InfoSidebar currentSession={currentSession} />
        </div>
      </div>
    </div>
  );
}

const assistantMessageStyle = (message: UIMessage) =>
  clsx(
    "bg-secondary text-secondary-foreground px-3 md:px-4 py-2 md:py-2",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-b-2xl rounded-tr-2xl "
      : "rounded-2xl"
  );

const userMessageStyle = (message: UIMessage) =>
  clsx(
    "bg-secondary text-secondary-foreground px-3 md:px-3 py-1 md:py-2",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-b-2xl rounded-tl-2xl"
      : "rounded-2xl"
  );

const SessionList = ({
  sessions,
  agent,
  currentSession,
  setcurrentSession,
}: {
  agent: IAgent;
  sessions: ISession[];
  currentSession?: ISession;
  setcurrentSession: (session: ISession) => void;
}) => {
  const nChats = useHistoryStore((state) => state.nChats);
  const hasMore = useHistoryStore((state) => state.hasMore);
  const fetchNextSessions = useHistoryStore((state) => state.fetchNextSessions);
  return (
    <div className="bg-secondary h-full">
      <div className="h-14 border-b bg-gray-100 px-4 y-4 grid place-items-center">
        <div className="w-full">
          <p className="text-sm">History</p>
          <p className="text-xs text-muted-foreground ">
            Showing {sessions.length}/{nChats} chats
          </p>
        </div>
      </div>
      <InfiniteScroll
        dataLength={nChats}
        scrollableTarget="scrollableDiv"
        scrollThreshold={0.8}
        className="bg-secondary"
        next={() => {
          fetchNextSessions(agent.id);
        }}
        hasMore={hasMore}
        loader={
          <div className="py-4 text-center mx-auto w-full">
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          </div>
        }
        endMessage={
          <div className="py-4 text-sm text-center text-muted-foreground">
            End of conversations
          </div>
        }
      >
        {sessions?.map((session, index) => {
          const channel = session.channel;
          return (
            <div
              key={session.id}
              className={`px-4 flex items-center justify-between gap-2 transition-all duration-100 cursor-pointer py-3 border-b ${
                currentSession?.id === session.id
                  ? "bg-card border-l-2 border-b-0 border-primary"
                  : ""
              }`}
              onClick={() => setcurrentSession(session)}
            >
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-0.5 ">
                  {channel === "web"
                    ? "Visitor"
                    : channel === "messenger"
                    ? "FB"
                    : channel === "instagram"
                    ? "IG"
                    : channel === "email"
                    ? "Email"
                    : channel === "slack"
                    ? "SL"
                    : channel === "whatsapp"
                    ? "WA"
                    : "API"}
                  -{session.id.split("-")[0]}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(session.updatedAt)}
                </p>
              </div>

              <div>
                {channel === "web" ? (
                  <Globe className="size-4.5" />
                ) : channel === "whatsapp" ? (
                  <WAIcon className="size-5" />
                ) : channel === "instagram" ? (
                  <InstagramIcon className="size-4.5" />
                ) : channel === "messenger" ? (
                  <MessengerIcon className="size-4.5" />
                ) : channel === "email" ? (
                  <MailIcon className="size-4.5" />
                ) : channel === "slack" ? (
                  <SlackLogo className="size-4.5" />
                ) : (
                  <></>
                )}
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

const HistoryMessageList = ({
  agent,
  currentSession,
}: {
  agent: IAgent;
  currentSession?: ISession;
}) => {
  const brandColor = agent.customization.primaryColor;
  const fontColor = getContrastingColor(brandColor);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  return (
    <div>
      {currentSession && (
        <div className="">
          <div className="border-b bg-gray-100 h-14 px-4 grid place-items-center sticky top-0 z-10">
            <div className="w-full">
              <h4 className="text-sm font-medium text-gray-700 mb-0.5 ">
                Visitor-{currentSession.id.split("-")[0]}
              </h4>
              <p className="text-xs text-muted-foreground">
                {formatDate(currentSession.updatedAt)}
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 pb-8 space-y-4 ">
            {currentSession.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={clsx(
                    "max-w-[90%] md:max-w-[75%] leading-7",
                    message.role === "user" && userMessageStyle(message),
                    message.role === "assistant" && [
                      assistantMessageStyle(message),
                    ]
                  )}
                  style={{
                    backgroundColor: message.role === "user" ? brandColor : "",
                    color: message.role === "user" ? fontColor : "",
                  }}
                >
                  {message.role === "assistant" ? (
                    message.parts?.map((part, partIndex) => {
                      if (part.type === "tool-collectInformation") {
                        return (
                          <div
                            className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
                            key={partIndex}
                          >
                            <div className="flex items-center gap-2 text-sm md:text-sm">
                              <User className="w-4 h-4" />
                              Personalized response
                            </div>
                          </div>
                        );
                      }

                      if (part.type === "dynamic-tool") {
                        return (
                          <div
                            className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
                            key={partIndex}
                          >
                            <div className="flex items-center gap-2 text-sm md:text-sm">
                              <User className="w-4 h-4" />
                              {part.toolName}
                            </div>
                          </div>
                        );
                      }
                      if (part.type === "tool-searchKnowledge") {
                        return (
                          <div
                            className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
                            key={partIndex}
                          >
                            <div className="flex items-center gap-2 text-sm md:text-sm">
                              <User className="w-4 h-4" />
                              Searched knowledge base
                            </div>
                          </div>
                        );
                      }

                      if (part.type === "text") {
                        return (
                          <div key={partIndex}>
                            <div
                              className="text-sm md:text-sm prose prose-sm md:prose-sm max-w-none leading-loose "
                              key={index}
                            >
                              <Streamdown>{part.text}</Streamdown>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : message.role === "user" ? (
                    <div className="text-sm prose prose-sm md:prose-sm max-w-none leading-loose ">
                      {message.parts?.map((part, partIndex) => (
                        <div key={partIndex} className="">
                          <Streamdown>
                            {part.type === "text" ? part.text ?? "" : ""}
                          </Streamdown>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}

            {currentSession.messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No messages in this conversation yet.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export const InfoSidebar = ({
  currentSession,
}: {
  currentSession?: ISession;
}) => {
  const persons = useHistoryStore((state) => state.persons);

  if (!currentSession?.personId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">No Contact Selected</p>
        <p className="text-xs text-center leading-relaxed mt-1">
          Choose a conversation to view contact information
        </p>
      </div>
    );
  }

  const person = persons[currentSession.personId];

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Profile Header */}
      <div className="text-center py-6 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-medium shadow-sm">
          {person.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {person.name || "Unknown Contact"}
        </h2>
        {person.title && (
          <p className="text-sm text-gray-600 mb-1">{person.title}</p>
        )}
        {person.company && (
          <p className="text-sm text-gray-500">{person.company}</p>
        )}
        {person.location && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Globe className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{person.location}</span>
          </div>
        )}
      </div>

      {/* Contact Details */}
      <div className="flex-1 px-4 space-y-6 overflow-y-auto">
        {/* Email */}
        {person.emails?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MailIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
            <div className="space-y-2 ml-6">
              {person.emails.map((email, index) => (
                <div key={index} className="text-sm text-gray-900 break-all">
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phone */}
        {person.phones?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Phone</span>
            </div>
            <div className="space-y-2 ml-6">
              {person.phones.map((phone, index) => (
                <div key={index} className="text-sm text-gray-900 font-mono">
                  {phone}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {person.interests?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Interests
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {person.interests.map((interest, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {person.tags?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {person.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Memories */}
        {person.memories?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Memories
              </span>
            </div>
            <div className="space-y-2 ml-6">
              {person.memories.slice(0, 3).map((memory, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100"
                >
                  {memory}
                </div>
              ))}
              {person.memories.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{person.memories.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {person.notes?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Notes</span>
            </div>
            <div className="space-y-2 ml-6">
              {person.notes.slice(0, 2).map((note, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                >
                  {note}
                </div>
              ))}
              {person.notes.length > 2 && (
                <p className="text-xs text-gray-500 italic">
                  +{person.notes.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Connected Accounts */}
        {person.externalIds && Object.keys(person.externalIds).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Connected
              </span>
            </div>
            <div className="space-y-2 ml-6">
              {Object.entries(person.externalIds).map(([platform, id]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 capitalize">{platform}</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
                    {id}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(person.createdAt || person.updatedAt) && (
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          {person.createdAt && <div>Added {formatDate(person.createdAt)}</div>}
          {person.updatedAt && person.updatedAt !== person.createdAt && (
            <div>Updated {formatDate(person.updatedAt)}</div>
          )}
        </div>
      )}
    </div>
  );
};
