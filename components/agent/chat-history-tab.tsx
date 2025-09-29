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
import { Globe, Loader2, MailIcon } from "lucide-react";
import { InstagramIcon, MessengerIcon, WAIcon } from "@/lib/logos";

interface ChatHistoryTabProps {
  agent: IAgent;
}

export default function ChatHistoryTab({ agent }: ChatHistoryTabProps) {
  const [sessions, setsessions] = useState<ISession[]>();
  const [currentSession, setcurrentSession] = useState<ISession>();

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
        <div className="p-4 border-l"></div>
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
        {sessions?.map((session) => {
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
                    message.parts?.map((part, partIndex) => (
                      <div key={partIndex} className="text-sm">
                        {part.type === "text" && part.text}
                      </div>
                    ))
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
