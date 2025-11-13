"use client";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChatRequestOptions,
  ChatStatus,
  DefaultChatTransport,
  UIMessage,
} from "ai";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import {
  ArrowDown,
  ArrowUp,
  BookMarkedIcon,
  Globe,
  RotateCcw,
  Square,
  Trash2Icon,
} from "lucide-react";
import teachService from "@/lib/services/teach-services";

import { cn, formatDateTime, getContrastingColor } from "@/lib/utils";
import clsx from "clsx";
import { TextShimmer } from "../ui/text-shimmer";
import { Streamdown } from "streamdown";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import {
  teachKnowledgeKey,
  useTechKnowledge,
} from "@/lib/hooks/knowledge/use-knowledge-base";
import { useQueryClient } from "@tanstack/react-query";
import { useKnowledgeActions } from "@/lib/hooks/knowledge/use-knowledge-actions";
import ConfirmationDialog from "../ui/confirmation-dialog";
import { ITeachKnowledge } from "@/lib/types/knowledge";

import {
  getTeachLocalSession,
  saveTeachLocalSession,
} from "../chat/chat-utils";
import { useTeachSession } from "@/lib/hooks/teach-session/use-teach-session";
import { useTeachSessionActions } from "@/lib/hooks/teach-session/use-teach-session-actions";

const useBrandColors = () => {
  const [colors, setColors] = useState({ primary: "", primaryForeground: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue("--primary").trim();
    const primaryForeground = getComputedStyle(root)
      .getPropertyValue("--primary-foreground")
      .trim();
    setColors({ primary, primaryForeground });
  }, []);

  return colors;
};

export default function TrainTab() {
  const { wid } = useParams() as { wid: string };
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const lastToolRef = useRef<string | null>(null);
  const { data: teachContent, isPending } = useTechKnowledge(wid);
  const { deleteTeachKnowledge } = useKnowledgeActions();
  const [teachToDelete, setTeachToDelete] = useState<ITeachKnowledge | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const sidRef = useRef<string | null>(null);
  const { data: session } = useTeachSession(wid);
  const { createSession } = useTeachSessionActions(wid);

  const initialAssistantMessage: UIMessage = {
    id: "Initial-agent-message",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hello there! How can I help you today?",
      },
    ],
  };

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [initialAssistantMessage],

    transport: new DefaultChatTransport({
      api: "/api/teach-stream",
      body: { wid },
    }),

    onToolCall: async ({ toolCall }) => {
      lastToolRef.current = toolCall.toolName;
    },

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
      setMessages((prev) => [...prev, aimsg] as any);
    },
    onFinish: async (evt) => {
      const aimsg = evt.message as unknown as IChatMessage;
      const prevMessages = evt.messages.slice(0, -1);

      if (lastToolRef.current === "saveTrainingKnowledge") {
        lastToolRef.current = null;
        if (!wid) throw new Error("Missing workspace id");
        await queryClient.invalidateQueries({
          queryKey: teachKnowledgeKey(wid),
        });
      }
      const currentSid = sidRef.current;
      setMessages([...prevMessages, aimsg] as any);
      if (wid && currentSid) {
        teachService.saveTeachMessage(wid, currentSid, aimsg);
      }
    },
  });

  const handleChatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    _options: ChatRequestOptions
  ) => {
    e.preventDefault();
    const currentSid = sidRef.current;
    if (!input.trim() || !wid || !currentSid) return;

    sendMessage({
      parts: [
        {
          type: "text",
          text: input,
        },
      ],
    });

    setInput("");

    const userMsg = defaultUserMessage(input);
    teachService.saveTeachMessage(wid, currentSid, userMsg);
  };

  const handleDeleteKnowledge = async (content: ITeachKnowledge) => {
    setTeachToDelete(content);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (teachToDelete) {
      await deleteTeachKnowledge.mutateAsync({ wid, tid: teachToDelete.id });
      setDeleteModalOpen(false);
      setTeachToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTeachToDelete(null);
  };
  useEffect(() => {
    const init = async () => {
      if (!wid) return;
      let localSid = getTeachLocalSession(wid);
      if (!localSid) {
        const session = await teachService.createTeachSession(wid);
        localSid = session.id;
        saveTeachLocalSession(wid, localSid);
      }
      sidRef.current = localSid;
      const existing = await teachService.getTeachSession(wid, localSid);
      if (existing?.messages?.length) {
        setMessages(existing.messages as any);
      } else {
        setMessages([initialAssistantMessage] as any);
      }
    };
    init();
  }, [wid, setMessages, session]);

  // Handle scroll detection
  useEffect(() => {
    const messageContainer = messageListRef.current;
    if (!messageContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messageContainer;
      const scrollThreshold = 100; // Show button when scrolled up more than 100px from bottom
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight < scrollThreshold;
      setShowScrollButton(!isNearBottom);
    };

    messageContainer.addEventListener("scroll", handleScroll);
    return () => messageContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  //
  const handleRefresh = async () => {
    if (!wid) return;
    console.log("test");
    const newSession = await createSession.mutateAsync();
    sidRef.current = newSession.id;
    saveTeachLocalSession(wid, newSession.id);
    setMessages([initialAssistantMessage] as any);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:p-6 place py-6 items-center ">
      <div className="relative h-[75vh] max-h-[900px] min-h-[500px] mx-auto">
        <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="h-[calc(75vh-1rem)]  max-h-[calc(900px-1rem)] min-h-[calc(500px-1rem)] aspect-[9/16]">
              <div
                className={`h-full flex flex-col overflow-hidden relative mx-auto  `}
              >
                <TrainChatHeader onRefresh={handleRefresh} />

                <div className="flex-1 overflow-y-auto " ref={messageListRef}>
                  <TrainMessageList
                    messages={messages as IChatMessage[]}
                    status={status}
                  />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {showScrollButton && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute z-10 ${"bottom-24 right-4"}`}
                    >
                      <Button
                        onClick={scrollToBottom}
                        size="icon"
                        variant={"outline"}
                        aria-label="Scroll to latest message"
                        className="w-8 h-8 text-muted-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <TrainChatInput
                  input={input}
                  handleSubmit={handleChatSubmit}
                  handleInputChange={(e) => setInput(e.target.value)}
                  status={status}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Card className="w-full h-[75vh] max-h-[900px] min-h-[500px] mt-4 md:mt-0">
        <CardContent className="overflow-y-auto py-2">
          {isPending ? (
            // Shimmer
            <Shimmer />
          ) : teachContent && teachContent.length > 0 ? (
            <ul role="list" className="space-y-3">
              <AnimatePresence initial={true}>
                {teachContent.map((content, index) => (
                  <motion.li
                    key={`${content.id ?? index}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="group border rounded-md p-4 transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/70"
                  >
                    <div className="relative">
                      <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-75 transition-opacity">
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => handleDeleteKnowledge(content)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 ">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                          <BookMarkedIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2 justify-between">
                            <h3 className="font-medium  leading-6 line-clamp-2">
                              {content.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-6 line-clamp-4">
                        {content.content}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center border rounded-md p-8 text-muted-foreground">
              <div className="p-3 rounded-md bg-muted mb-3">
                <BookMarkedIcon className="size-5" aria-hidden="true" />
              </div>
              <p className="font-medium">No knowledge added yet</p>
              <p className="text-sm mt-1">
                Use the chat on the left to add facts your agent can learn from.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Knowledge"
        description={`Are you sure you want to delete "${teachToDelete?.title}"?`}
        warningMessage="This action cannot be undone. The knowledge will be permanently removed from your knowledge base."
        confirmText="Delete Knowledge"
        cancelText="Cancel"
        isLoading={deleteTeachKnowledge.isPending}
        variant="destructive"
      />
    </div>
  );
}

const TrainChatHeader = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <div className="border-b border-border bg-card px-6 py-4 flex justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
            alt="Agent"
            className="size-8 rounded-full object-cover"
          />

          <div>
            <h4 className=" font-medium text-foreground ">Agent Training</h4>
            <p className="text-sm text-muted-foreground">
              Train your agent through conversation.
            </p>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onRefresh}
        aria-label="Refresh training session"
        title="Refresh training session"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
interface TrainMessageListProps {
  messages: IChatMessage[];
  status: ChatStatus;
}

const TrainMessageList = ({ messages, status }: TrainMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const previousMessageCountRef = useRef(messages.length);
  const showLoadingIndicator = status === "submitted";
  const { primary: brandColor, primaryForeground: fontColor } =
    useBrandColors();
  useEffect(() => {
    const currentMessageCount = messages.length;
    const hasNewMessage = currentMessageCount > previousMessageCountRef.current;

    if (hasNewMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 ">
      <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
        {messages.map((message, index) => {
          const isLastAssistantMessage =
            message.role === "assistant" && index === messages.length - 1;

          return (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } `}
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
                    <>
                      {message.parts?.map((part, index) => {
                        if (part.type === "tool-searchKnowledge") {
                          const isCalling = part.state !== "output-available";
                          return (
                            <div
                              className={`inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 transition-all duration-300 ease-in-out ${
                                isCalling ? "px-0 py-0" : "px-3 py-1.5 border"
                              }`}
                              style={{
                                backgroundColor: isCalling
                                  ? "transparent"
                                  : `${brandColor}10`,
                                borderColor: isCalling
                                  ? "transparent"
                                  : `${brandColor}40`,
                                color: isCalling ? brandColor : brandColor,
                              }}
                              key={index}
                            >
                              {isCalling ? (
                                <div
                                  key={`${part.state}-calling`}
                                  className="flex gap-2 items-center animate-in fade-in "
                                >
                                  <Globe
                                    className="w-4 h-4 animate-bounce"
                                    style={{ color: brandColor }}
                                  />
                                  <TextShimmer
                                    className="text-sm md:text-base"
                                    style={
                                      {
                                        "--base-color": brandColor,
                                        "--base-gradient-color": `${brandColor}80`,
                                      } as React.CSSProperties
                                    }
                                    duration={1.5}
                                    spread={1.5}
                                  >
                                    Searching knowledge...
                                  </TextShimmer>
                                </div>
                              ) : (
                                <div
                                  key={`${part.state}-output-available`}
                                  className="flex items-center gap-2 text-sm md:text-sm"
                                >
                                  <Globe className="w-4 h-4" />
                                  Searched knowledge
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (part.type === "tool-saveTrainingKnowledge") {
                          const isCalling = part.state !== "output-available";

                          return (
                            <div
                              className={`inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 transition-all duration-300 ease-in-out ${
                                isCalling ? "px-0 py-0" : "px-3 py-1.5 border"
                              }`}
                              style={{
                                backgroundColor: isCalling
                                  ? "transparent"
                                  : `${brandColor}10`,
                                borderColor: isCalling
                                  ? "transparent"
                                  : `${brandColor}40`,
                                color: isCalling ? brandColor : brandColor,
                              }}
                              key={index}
                            >
                              {isCalling ? (
                                <div
                                  key={`${part.state}-calling`}
                                  className="flex gap-2 items-center animate-in fade-in "
                                >
                                  <BookMarkedIcon
                                    className="w-4 h-4 animate-bounce"
                                    style={{ color: brandColor }}
                                  />
                                  <TextShimmer
                                    className="text-sm md:text-base"
                                    style={
                                      {
                                        "--base-color": brandColor,
                                        "--base-gradient-color": `${brandColor}80`,
                                      } as React.CSSProperties
                                    }
                                    duration={1.5}
                                    spread={1.5}
                                  >
                                    Learning knowledge...
                                  </TextShimmer>
                                </div>
                              ) : (
                                <div
                                  key={`${part.state}-output-available`}
                                  className="flex items-center gap-2 text-sm md:text-sm"
                                >
                                  <BookMarkedIcon className="w-4 h-4" />
                                  Knowledge saved
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (part.type === "text") {
                          return (
                            <div key={index}>
                              <div
                                className="text-sm md:text-base prose prose-sm md:prose-base max-w-none leading-loose "
                                key={index}
                              >
                                <Streamdown
                                  components={{
                                    a: ({ href, children }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-2"
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
                      })}
                    </>
                  ) : (
                    <>
                      <div className={""}>
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-loose">
                          {message.parts.map(
                            (part) => part.type === "text" && part.text
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isLastAssistantMessage && (
                <div
                  className={`flex items-center gap-4 max-w-[90%] md:max-w-[75%] w-full mt-2 px-2`}
                >
                  <p className="text-left flex-1  text-xs text-muted-foreground">
                    {formatDateTime(message.metadata?.createdAt ?? "")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {showLoadingIndicator && (
          <div className={"flex justify-start"}>
            <div
              className={clsx(
                "max-w-[90%] md:max-w-[75%] leading-7",
                assistantMessageStyle({
                  id: "loading",
                  role: "assistant",
                  parts: [{ type: "text", text: "" }],
                } as UIMessage),
                "px-3 py-3"
              )}
            >
              <div className="flex gap-1.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-neutral-500" />
                <div
                  className="w-1.5 h-1.5 rounded-full  animate-bounce bg-neutral-500"
                  style={{ animationDelay: "0.13s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-bounce bg-neutral-500"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div
          ref={messagesEndRef}
          className="min-h-[calc(clamp(500px-1rem,75vh-1rem,900px-1rem)-20rem)]"
        ></div>
      </div>
    </div>
  );
};

{
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
    "bg-secondary text-secondary-foreground px-3 md:px-4 py-1 md:py-1.5",
    message.parts.some((part) => part.type === "text") &&
      message.parts.length <= 50
      ? "rounded-b-2xl rounded-tl-2xl"
      : "rounded-2xl"
  );

interface TrainChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    options: ChatRequestOptions
  ) => void;
  status: ChatStatus;
  isWidget?: boolean;
}

const TrainChatInput = ({
  input,
  handleSubmit,
  handleInputChange,
  status,
}: TrainChatInputProps) => {
  const isLoading = status !== "ready" && status !== "error";
  const { primary: primaryColor } = useBrandColors();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, {});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  return (
    <div className="px-3 py-3">
      <div className="flex items-end gap-3">
        <div
          className={cn(
            "flex-1 border-1 relative rounded-lg transition-all duration-200 focus-within:ring-2"
          )}
          style={
            {
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties & { "--tw-ring-color": string }
          }
        >
          <form
            onSubmit={handleFormSubmit}
            className="flex items-end gap-2 p-1 "
          >
            {/* Textarea */}
            <div className="w-full flex-1 relative">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={"Type your message here..."}
                aria-label="Type your message"
                className="text-sm md:text-base p-1 pl-1.5 rounded-none md:p-2 w-full min-h-[32px] max-h-[200px] resize-none border-0 bg-transparent leading-relaxed transition-all duration-200 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 shadow-none"
                rows={1}
              />
            </div>

            {/* Send/Stop Button */}
            <div className="flex-shrink-0 ">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <Button
                  type={isLoading ? "button" : "submit"}
                  variant={isLoading ? "ghost" : "default"}
                  disabled={isLoading || !input.trim()}
                  aria-label={isLoading ? "Stop" : "Send message"}
                  style={{
                    backgroundColor:
                      isLoading || !input.trim() ? "transparent" : primaryColor,
                    color:
                      isLoading || !input.trim()
                        ? "black"
                        : getContrastingColor(primaryColor),
                  }}
                  className={clsx(
                    "md:w-10 md:h-10 w-8 h-8 rounded-full transition-colors disabled:opacity-50"
                  )}
                >
                  {isLoading ? (
                    <Square className="md:h-10 md:w-10 h-8 w-8 animate-[spin_2s_linear_infinite] fill-black" />
                  ) : (
                    <ArrowUp className="md:h-5 md:w-5 scale-110 " />
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Shimmer = () => {
  return (
    <div className="space-y-3">
      <div className="border rounded-md p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-7 rounded-md bg-muted" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-3 w-full bg-muted rounded mb-2" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
      <div className="border rounded-md p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-7 rounded-md bg-muted" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-3 w-full bg-muted rounded mb-2" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    </div>
  );
};
