"use client";

import { IAgent } from "@/lib/types/agent";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useMemo, useRef, useState } from "react";
import { ISession } from "@/lib/types/session";
import {
  formatDate,
  formatDateTime,
  formatHistoryDateTime,
  getContrastingColor,
} from "@/lib/utils";
import clsx from "clsx";
import { consumeStream, UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { useHistoryStore } from "@/lib/stores/history-store";
import {
  Check,
  Circle,
  Globe,
  Loader,
  MailIcon,
  MessageCircleMoreIcon,
  PanelRightClose,
  PanelRightOpen,
  User,
} from "lucide-react";
import { InstagramIcon, MessengerIcon, SlackLogo, WAIcon } from "@/lib/logos";
import { Button } from "../ui/button";
import { InfoSidebar } from "./history/info-sidebar";
import { useQueryState } from "nuqs";

interface ChatHistoryTabProps {
  agent: IAgent;
}

export default function ChatHistoryTab({ agent }: ChatHistoryTabProps) {
  const [sessionId, setSessionId] = useQueryState("sid");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const history = useHistoryStore((state) => state.history);
  const subscribeToHistory = useHistoryStore(
    (state) => state.subscribeToSessions
  );
  const unsubscribeHistory = useHistoryStore(
    (state) => state.unsubscribeFromSessions
  );
  const fetchAndAddSessionToHistory = useHistoryStore(
    (state) => state.fetchAndAddSessionToHistory
  );
  const loadingSessionIds = useHistoryStore((state) => state.loadingSessionIds);

  useEffect(() => {
    subscribeToHistory(agent.id);
    return () => unsubscribeHistory();
  }, [agent.id]);

  //map is better approach than useState
  const sessionsMap = useMemo(
    () => new Map(history?.map((s) => [s.id, s]) ?? []),
    [history]
  );
  const currentSession = sessionId ? sessionsMap.get(sessionId) : undefined;
  const handleSetSession = (session: ISession) => setSessionId(session.id);
  const handleSetSessionId = (id: string) => setSessionId(id);

  // Fetch session when URL changes and it's not in map
  useEffect(() => {
    if (!sessionId) return;

    const session = sessionsMap.get(sessionId);
    if (session) return; // Already in map

    if (loadingSessionIds.has(sessionId)) return; // Already loading

    fetchAndAddSessionToHistory(sessionId, agent.id);
  }, [sessionId, agent.id]);

  return (
    <div className="h-full p-4">
      <div className={`bg-card border rounded-xl h-full overflow-hidden flex`}>
        {/* Chats Sidebar */}
        <aside className="w-[280px] flex-shrink-0 p-0 border-r">
          <SessionList
            agent={agent}
            sessions={history ?? []}
            currentSession={currentSession}
            setcurrentSession={handleSetSession}
          />
        </aside>

        {/* Chat Content */}
        <div
          className={`p-0 transition-all flex-1 flex flex-col overflow-hidden`}
        >
          <HistoryMessageList
            agent={agent}
            currentSession={currentSession}
            isCollapsed={isCollapsed}
            onCollapsedChange={setIsCollapsed}
          />
        </div>

        {/* User Info Sidebar */}
        <aside
          className={`p-0 border-l w-[280px] flex-shrink-0 ${
            currentSession?.personId && !isCollapsed ? "" : "hidden"
          }`}
        >
          <InfoSidebar
            currentSession={currentSession}
            setcurrentSession={handleSetSession}
            setSessionId={handleSetSessionId}
            sessions={history ?? []}
          />
        </aside>
      </div>
    </div>
  );
}

const assistantMessageStyle = (message: UIMessage) =>
  clsx(
    "bg-secondary text-secondary-foreground px-3 md:px-4 py-2 md:py-2",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-t-2xl rounded-br-2xl "
      : "rounded-2xl"
  );

const userMessageStyle = (message: UIMessage) =>
  clsx(
    "bg-secondary text-secondary-foreground px-3 md:px-3 py-1 md:py-2",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-t-2xl rounded-bl-2xl"
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

  const persons = useHistoryStore((state) => state.persons);

  const renderVisitorID = (session: ISession) => {
    const channel = session.channel;
    const type =
      channel === "web"
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
        : "API";
    return `${type}-${session.id.split("-")[0]}`;
  };
  return (
    <div className="bg-secondary h-full flex flex-col">
      <div className="h-14 border-b bg-muted/10 px-4 grid place-items-center flex-shrink-0">
        <div className="w-full">
          <p className="text-sm text-foreground">Conversations</p>
          <p className="text-xs text-muted-foreground ">
            Showing {sessions.length}/{nChats} chats
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar" id="scrollableDiv">
        <InfiniteScroll
          dataLength={sessions.length}
          scrollableTarget="scrollableDiv"
          scrollThreshold={0.8}
          className="bg-secondary"
          next={() => {
            fetchNextSessions(agent.id);
          }}
          hasMore={hasMore}
          loader={
            <div className="py-4 text-center mx-auto w-full">
              <Loader className="w-4 h-4 animate-spin mx-auto" />
            </div>
          }
          endMessage={
            <div className="py-4 text-sm text-center text-muted-foreground">
              End of conversations
            </div>
          }
        >
          {sessions?.map((session) => {
            const channel = session.channel;
            const person = session.personId
              ? persons[session.personId]
              : undefined;

            return (
              <div
                key={session.id}
                className={`px-4 flex items-center justify-between gap-2 transition-all duration-100 cursor-pointer py-3.5 border-b hover:bg-card/70 ${
                  currentSession?.id === session.id
                    ? "bg-card border-l-2 border-b-0 border-primary"
                    : ""
                }`}
                onClick={() => setcurrentSession(session)}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-0.5 truncate ">
                    {person
                      ? person.name
                        ? person.name
                        : person.emails
                        ? person.emails[0]
                        : renderVisitorID(session)
                      : renderVisitorID(session)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatHistoryDateTime(session.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex gap-1 items-center ${
                      session.status === "open"
                        ? "text-green-700 dark:text-green-400 bg-green-400/20 dark:bg-green-500/20"
                        : "text-muted-foreground bg-muted-foreground/10"
                    } `}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        session.status === "open"
                          ? "bg-green-500 dark:bg-green-400 "
                          : "bg-muted-foreground "
                      }`}
                    ></div>
                    {session.status === "open" ? "Open" : "Closed"}
                  </span>

                  <div>
                    {session.geo?.city && (
                      <span className="text-lg text-muted-foreground">
                        {session.geo.flag}
                      </span>
                    )}
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
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};

const HistoryMessageList = ({
  agent,
  currentSession,
  isCollapsed,
  onCollapsedChange,
}: {
  agent: IAgent;
  currentSession?: ISession;
  isCollapsed: boolean;
  onCollapsedChange: (c: boolean) => void;
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

  const persons = useHistoryStore((state) => state.persons);
  return (
    <div className="h-full flex flex-col">
      {currentSession && (
        <>
          <div className="border-b bg-muted h-14 px-4 flex justify-between items-center flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-0.5">
                {currentSession.personId && persons[currentSession.personId]
                  ? persons[currentSession.personId].name
                  : `Visitor-${currentSession.id.split("-")[0]}`}
              </h4>
              <p className="text-xs text-muted-foreground">
                {formatDate(currentSession.updatedAt)}
              </p>
            </div>
            {currentSession.personId && (
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => onCollapsedChange(!isCollapsed)}
                className="transition-all text-muted-foreground hover:text-primary pr-0 w-min flex-shrink-0"
              >
                {isCollapsed ? (
                  <PanelRightOpen className="size-4.5" />
                ) : (
                  <PanelRightClose className="size-4.5" />
                )}
              </Button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="p-4 pb-8 space-y-4 prose-p:my-0 flex-1 overflow-y-auto">
            {currentSession.messages.map((message) => (
              <div
                key={message.id}
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
                              key={partIndex}
                            >
                              <Streamdown
                                components={{
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline underline-offset-2"
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {part.text}
                              </Streamdown>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : message.role === "user" ? (
                    <div
                      className="text-sm prose prose-sm md:prose-sm max-w-none leading-loose "
                      style={{ color: fontColor }}
                    >
                      {message.parts?.map((part, partIndex) => (
                        <div key={partIndex} className="">
                          <Streamdown
                            components={{
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium  transition-colors underline underline-offset-2"
                                  style={{ color: fontColor }}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
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
        </>
      )}
    </div>
  );
};
