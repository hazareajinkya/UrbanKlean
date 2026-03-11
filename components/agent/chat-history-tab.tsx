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
  getEmotionIcon,
} from "@/lib/utils";
import clsx from "clsx";
import { consumeStream, UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { useHistoryStore } from "@/lib/stores/history-store";
import {
  Check,
  Circle,
  FrownIcon,
  Globe,
  Loader,
  MailIcon,
  MehIcon,
  MessageCircleMoreIcon,
  PanelRightClose,
  PanelRightOpen,
  SmileIcon,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Tag,
  Lightbulb,
  Heart,
  ClipboardList,
  Flag,
  Shield,
  FileText,
  EyeIcon,
  MessageSquareIcon,
  Briefcase,
  Cog,
  Send,
} from "lucide-react";
import { InstagramIcon, MessengerIcon, SlackLogo, WAIcon } from "@/lib/logos";
import { Button } from "../ui/button";
import { InfoSidebar } from "./history/info-sidebar";
import { useQueryState } from "nuqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChatSummary } from "./history/chat-summary";
import SendTemplateModal from "./history/send-template-modal";

interface ChatHistoryTabProps {
  agent: IAgent;
}

export default function ChatHistoryTab({ agent }: ChatHistoryTabProps) {
  const [sessionId, setSessionId] = useQueryState("sid");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const history = useHistoryStore((state) => state.history);
  const subscribeToHistory = useHistoryStore(
    (state) => state.subscribeToSessions,
  );
  const unsubscribeHistory = useHistoryStore(
    (state) => state.unsubscribeFromSessions,
  );
  const fetchAndAddSessionToHistory = useHistoryStore(
    (state) => state.fetchAndAddSessionToHistory,
  );
  const loadingSessionIds = useHistoryStore((state) => state.loadingSessionIds);

  useEffect(() => {
    subscribeToHistory(agent.id);
    return () => unsubscribeHistory();
  }, [agent.id]);

  const currentSession = useMemo(
    () => (sessionId ? history?.find((s) => s.id === sessionId) : undefined),
    [history, sessionId],
  );
  const handleSetSession = (session: ISession) => setSessionId(session.id);
  const handleSetSessionId = (id: string) => setSessionId(id);

  // Fetch session when URL changes and it's not in history
  useEffect(() => {
    if (!sessionId) return;

    // Use currentSession derived above
    if (currentSession) return; // Already loaded

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
            (currentSession?.personId || currentSession?.geo) && !isCollapsed
              ? ""
              : "hidden"
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
      : "rounded-2xl",
  );

const userMessageStyle = (message: UIMessage) =>
  clsx(
    "bg-secondary text-secondary-foreground px-3 md:px-3 py-1 md:py-2",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-t-2xl rounded-bl-2xl"
      : "rounded-2xl",
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
                  <h4 className="text-sm font-medium text-foreground mb-0.5 truncate">
                    {person
                      ? person.name
                        ? person.name
                        : // : person.emails
                          // ? person.emails[0].value
                          renderVisitorID(session)
                      : renderVisitorID(session)}

                    {session.chatSummary?.sentiment && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-2 inline-flex cursor-default">
                            {getEmotionIcon(session.chatSummary.sentiment)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">
                            {session.chatSummary.sentiment}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </h4>
                  <p></p>
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

  const [isSendTemplateModalOpen, setIsSendTemplateModalOpen] = useState(false);
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
            <div className="flex gap-2 items-center">
              {currentSession.channel === "whatsapp" &&
                persons[currentSession.personId ?? ""]?.phones?.[0]?.value && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center gap-1.5 text-xs transition-all duration-200"
                    onClick={() => setIsSendTemplateModalOpen(true)}
                    aria-label="Send WhatsApp template message"
                  >
                    <WAIcon className="w-3.5 h-3.5" />
                    Send Template
                  </Button>
                )}
              {(currentSession.personId || currentSession.geo) && (
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
          </div>

          {/* Chat Messages */}
          <div className="p-4 pb-8 space-y-4 flex-1 overflow-y-auto">
            {currentSession.messages.map((message, index) => (
              <div
                key={message.id + index}
                className={clsx(
                  "flex flex-col",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={clsx(
                    "max-w-[90%] md:max-w-[75%] leading-7",
                    message.role === "assistant" && [
                      assistantMessageStyle(message),
                    ],
                    message.role === "user" && "space-y-2",
                  )}
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
                            <div className="text-sm md:text-sm prose prose-sm md:prose-sm max-w-none leading-loose prose-p:mt-0 prose-p:last:mb-0">
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
                      if (part.type.startsWith("tool-")) {
                        return (
                          <div
                            className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
                            key={partIndex}
                          >
                            <div className="flex items-center gap-2 text-sm md:text-sm">
                              <Cog className="w-4 h-4" />
                              {part.type.split("-").slice(1).join("-")}
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : message.role === "user" ? (
                    <div className="space-y-2">
                      {message.parts?.map((part, partIndex) => (
                        <div key={partIndex}>
                          {part.type === "text" ? (
                            <div
                              className={clsx(
                                userMessageStyle(message),
                                "w-fit ml-auto text-sm prose prose-sm md:prose-sm max-w-none leading-loose prose-p:mt-0 prose-p:last:mb-0",
                              )}
                              style={{
                                backgroundColor: brandColor,
                                color: fontColor,
                              }}
                            >
                              <Streamdown
                                components={{
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium transition-colors underline underline-offset-2"
                                      style={{ color: fontColor }}
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {part.text ?? ""}
                              </Streamdown>
                            </div>
                          ) : part.type === "file" &&
                            part.mediaType?.startsWith("image/") ? (
                            <div
                              className="w-fit ml-auto rounded-2xl border border-border bg-background p-0.5"
                              style={{
                                backgroundColor: brandColor,
                                color: fontColor,
                              }}
                            >
                              <a
                                href={part.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={part.url}
                                  alt="Attachment"
                                  className="rounded-xl max-w-full max-h-40 object-contain"
                                />
                              </a>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                {message.metadata?.createdAt && (
                  <p className="pt-2 text-[11px] text-muted-foreground font-medium">
                    {formatDateTime(message.metadata.createdAt)}
                  </p>
                )}
              </div>
            ))}

            {currentSession.messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No messages in this conversation yet.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {currentSession.channel === "whatsapp" &&
            persons[currentSession.personId ?? ""]?.phones?.[0]?.value && (
              <SendTemplateModal
                wid={currentSession.wid}
                to={persons[currentSession.personId ?? ""].phones![0].value}
                aid={currentSession.aid}
                sessionId={currentSession.id}
                isOpen={isSendTemplateModalOpen}
                onClose={() => setIsSendTemplateModalOpen(false)}
              />
            )}

          {currentSession.chatSummary && (
            <ChatSummary summary={currentSession.chatSummary} />
          )}
        </>
      )}

      {currentSession?.chatSummary && (
        <ChatSummary summary={currentSession.chatSummary} />
      )}
    </div>
  );
};

// const HistoryMessageList = ({
//   agent,
//   currentSession,
//   isCollapsed,
//   onCollapsedChange,
// }: {
//   agent: IAgent;
//   currentSession?: ISession;
//   isCollapsed: boolean;
//   onCollapsedChange: (c: boolean) => void;
// }) => {
//   const brandColor = agent.customization.primaryColor;
//   const fontColor = getContrastingColor(brandColor);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const chatScrollRef = useRef<HTMLDivElement>(null);
//   const summaryScrollRef = useRef<HTMLDivElement>(null);
//   const [accordionValue, setAccordionValue] = useState<string>("chat");

//   const scrollToBottom = () => {
//     if (accordionValue === "chat" && chatScrollRef.current) {
//       chatScrollRef.current.scrollTo({
//         top: chatScrollRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentSession?.messages, accordionValue]);

//   useEffect(() => {
//     // Reset to chat when session changes
//     setAccordionValue("chat");
//   }, [currentSession?.id]);

//   const handleAccordionChange = (value: string) => {
//     const newValue = value || "chat";
//     setAccordionValue(newValue);

//     // Scroll to top when switching to summary, or to bottom when switching to chat
//     setTimeout(() => {
//       if (newValue === "summary" && summaryScrollRef.current) {
//         summaryScrollRef.current.scrollTo({
//           top: 0,
//           behavior: "smooth",
//         });
//       } else if (newValue === "chat" && chatScrollRef.current) {
//         chatScrollRef.current.scrollTo({
//           top: chatScrollRef.current.scrollHeight,
//           behavior: "smooth",
//         });
//       }
//     }, 100);
//   };

//   const persons = useHistoryStore((state) => state.persons);
//   return (
//     <div className="h-full flex flex-col">
//       {currentSession && (
//         <>
//           <div className="border-b bg-muted h-14 px-4 flex justify-between items-center flex-shrink-0">
//             <div className="flex-1 min-w-0">
//               <h4 className="text-sm font-medium text-foreground mb-0.5">
//                 {currentSession.personId && persons[currentSession.personId]
//                   ? persons[currentSession.personId].name
//                   : `Visitor-${currentSession.id.split("-")[0]}`}
//               </h4>
//               <p className="text-xs text-muted-foreground">
//                 {formatDate(currentSession.updatedAt)}
//               </p>
//             </div>
//             {currentSession.personId && (
//               <Button
//                 variant={"ghost"}
//                 size={"icon"}
//                 onClick={() => onCollapsedChange(!isCollapsed)}
//                 className="transition-all text-muted-foreground hover:text-primary pr-0 w-min flex-shrink-0"
//               >
//                 {isCollapsed ? (
//                   <PanelRightOpen className="size-4.5" />
//                 ) : (
//                   <PanelRightClose className="size-4.5" />
//                 )}
//               </Button>
//             )}
//           </div>

//           {/* Chat Messages and Summary Accordion */}
//           <div className="flex-1 overflow-hidden flex flex-col">
//             <Accordion
//               type="single"
//               collapsible
//               value={accordionValue}
//               onValueChange={handleAccordionChange}
//               className="flex-1 flex flex-col overflow-hidden"
//             >
//               <AccordionItem
//                 value="chat"
//                 className={clsx(
//                   "border-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
//                   accordionValue === "chat" ? "flex-1" : "flex-shrink-0"
//                 )}
//               >
//                 <AccordionTrigger className="px-4 py-3 border-b hover:no-underline text-sm font-medium flex-shrink-0 transition-all duration-200">
//                   Chat
//                 </AccordionTrigger>
//                 <AccordionContent
//                   disableAnimation
//                   containerClassName="flex-1 flex flex-col min-h-0 h-0 data-[state=closed]:flex-none data-[state=closed]:h-0"
//                   className="flex-1 flex flex-col min-h-0 h-full p-0"
//                 >
//                   <div
//                     ref={chatScrollRef}
//                     className="flex-1 h-0 min-h-0 overflow-y-auto p-4 pb-8 space-y-4 prose-p:my-0 scroll-smooth transition-opacity duration-200"
//                     style={{ opacity: accordionValue === "chat" ? 1 : 0 }}
//                   >
//                     {currentSession.messages.map((message) => (
//                       <div
//                         key={message.id}
//                         className={`flex ${
//                           message.role === "user"
//                             ? "justify-end"
//                             : "justify-start"
//                         }`}
//                       >
//                         <div
//                           className={clsx(
//                             "max-w-[90%] md:max-w-[75%] leading-7",
//                             message.role === "user" &&
//                               userMessageStyle(message),
//                             message.role === "assistant" && [
//                               assistantMessageStyle(message),
//                             ]
//                           )}
//                           style={{
//                             backgroundColor:
//                               message.role === "user" ? brandColor : "",
//                             color: message.role === "user" ? fontColor : "",
//                           }}
//                         >
//                           {message.role === "assistant" ? (
//                             message.parts?.map((part, partIndex) => {
//                               if (part.type === "tool-collectInformation") {
//                                 return (
//                                   <div
//                                     className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
//                                     key={partIndex}
//                                   >
//                                     <div className="flex items-center gap-2 text-sm md:text-sm">
//                                       <User className="w-4 h-4" />
//                                       Personalized response
//                                     </div>
//                                   </div>
//                                 );
//                               }

//                               if (part.type === "dynamic-tool") {
//                                 return (
//                                   <div
//                                     className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
//                                     key={partIndex}
//                                   >
//                                     <div className="flex items-center gap-2 text-sm md:text-sm">
//                                       <User className="w-4 h-4" />
//                                       {part.toolName}
//                                     </div>
//                                   </div>
//                                 );
//                               }
//                               if (part.type === "tool-searchKnowledge") {
//                                 return (
//                                   <div
//                                     className="inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 px-3 py-1.5 border transition-all duration-300 ease-in-out"
//                                     key={partIndex}
//                                   >
//                                     <div className="flex items-center gap-2 text-sm md:text-sm">
//                                       <User className="w-4 h-4" />
//                                       Searched knowledge base
//                                     </div>
//                                   </div>
//                                 );
//                               }

//                               if (part.type === "text") {
//                                 return (
//                                   <div key={partIndex}>
//                                     <div
//                                       className="text-sm md:text-sm prose prose-sm md:prose-sm max-w-none leading-loose "
//                                       key={partIndex}
//                                     >
//                                       <Streamdown
//                                         components={{
//                                           a: ({ href, children }) => (
//                                             <a
//                                               href={href}
//                                               target="_blank"
//                                               rel="noopener noreferrer"
//                                               className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline underline-offset-2"
//                                             >
//                                               {children}
//                                             </a>
//                                           ),
//                                         }}
//                                       >
//                                         {part.text}
//                                       </Streamdown>
//                                     </div>
//                                   </div>
//                                 );
//                               }
//                             })
//                           ) : message.role === "user" ? (
//                             <div
//                               className="text-sm prose prose-sm md:prose-sm max-w-none leading-loose "
//                               style={{ color: fontColor }}
//                             >
//                               {message.parts?.map((part, partIndex) => (
//                                 <div key={partIndex} className="">
//                                   <Streamdown
//                                     components={{
//                                       a: ({ href, children }) => (
//                                         <a
//                                           href={href}
//                                           target="_blank"
//                                           rel="noopener noreferrer"
//                                           className="font-medium  transition-colors underline underline-offset-2"
//                                           style={{ color: fontColor }}
//                                         >
//                                           {children}
//                                         </a>
//                                       ),
//                                     }}
//                                   >
//                                     {part.type === "text"
//                                       ? part.text ?? ""
//                                       : ""}
//                                   </Streamdown>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <></>
//                           )}
//                         </div>
//                       </div>
//                     ))}

//                     {currentSession.messages.length === 0 && (
//                       <div className="text-center text-muted-foreground py-8">
//                         No messages in this conversation yet.
//                       </div>
//                     )}

//                     <div ref={messagesEndRef} />
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>

//               {(currentSession.chatSummary ||
//                 currentSession.status === "closed" ||
//                 (currentSession as any).status === "inactive" ||
//                 (currentSession as any).closedAt) && (
//                 <AccordionItem
//                   value="summary"
//                   className={clsx(
//                     "border-0 border-t flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
//                     accordionValue === "summary" ? "flex-1" : "flex-shrink-0"
//                   )}
//                 >
//                   <AccordionTrigger className="px-4 py-3 border-b hover:no-underline text-sm font-medium flex-shrink-0 transition-all duration-200">
//                     Summary
//                   </AccordionTrigger>
//                   <AccordionContent
//                     disableAnimation
//                     containerClassName="flex-1 flex flex-col min-h-0 h-0 data-[state=closed]:flex-none data-[state=closed]:h-0"
//                     className="flex-1 flex flex-col min-h-0 h-full p-0"
//                   >
//                     <div
//                       ref={summaryScrollRef}
//                       className="flex-1 h-0 min-h-0 overflow-y-auto p-4 pb-8 scroll-smooth transition-opacity duration-200"
//                       style={{ opacity: accordionValue === "summary" ? 1 : 0 }}
//                     >
//                       {currentSession.chatSummary ? (
//                         <SummaryContent summary={currentSession.chatSummary} />
//                       ) : (
//                         <div className="text-center text-muted-foreground py-8">
//                           <p className="text-sm">
//                             No summary available for this session.
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               )}
//             </Accordion>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
