"use client";

import { Streamdown } from "streamdown";
import { UIMessage } from "ai";
import { formatDateTime, formatTime, getContrastingColor } from "@/lib/utils";
import { getMessageStyle, heightClass } from "@/lib/utils/message-utils";
import { useEffect, useRef, memo, useMemo, useState } from "react";
import clsx from "clsx";
import { ChatStatus } from "ai";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { IAgent } from "@/lib/types/agent";
import { ArrowDown, Globe, User } from "lucide-react";
import { IChatMessage } from "@/lib/types/session";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { MessageLoading } from "./message-loading";

interface MessageListProps {
  agent: IAgent;
  messages: IChatMessage[];
  status: ChatStatus;
  isWidget?: boolean;
}

export const MessageList = ({
  messages,
  status,
  agent,
  isWidget,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<IChatMessage[]>(messages);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const showLoadingIndicator = status === "submitted";

  const brandColor = agent.customization.primaryColor;
  const fontColor = useMemo(
    () => getContrastingColor(brandColor),
    [brandColor],
  );

  const scrollToLastMessageStart = () => {
    lastMessagesStartRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const scrollToEnd = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToLastMessageStart();
  }, []);

  // Scroll button visibility based on lastMessagesStartRef
  useEffect(() => {
    const target = lastMessagesStartRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollButton(!entry.isIntersecting),
      { root: containerRef.current, threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll: only on user message → scroll to end, AI response → no scroll
  useEffect(() => {
    const prevMessages = previousMessagesRef.current;
    const hasNewMessage = messages.length > prevMessages.length;

    if (hasNewMessage) {
      const newMessage = messages[messages.length - 1];
      if (newMessage?.role === "user") scrollToEnd();
    }

    previousMessagesRef.current = messages;
  }, [messages]);

  return (
    <>
      <div ref={containerRef} className="h-full overflow-y-auto p-4">
        <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const isLastAssistantMessage =
              message.role === "assistant" && index === messages.length - 1;

            if (message.role === "assistant") {
              return (
                <AssistantMessage
                  key={message.id ?? index}
                  message={message}
                  isLast={isLastAssistantMessage}
                />
              );
            }
            if (message.role === "user") {
              return (
                <UserMessage
                  key={message.id ?? index}
                  message={message}
                  brandColor={brandColor}
                  fontColor={fontColor}
                />
              );
            }
            if (message.role === "system") {
              return (
                <SystemMessage key={message.id ?? index} message={message} />
              );
            }
            return null;
          })}

          {showLoadingIndicator && <LoadingIndicator />}

          <div ref={lastMessagesStartRef} />
          <div ref={messagesEndRef} className={heightClass} />
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-1.5 right-4 z-10"
          >
            <Button
              onClick={scrollToLastMessageStart}
              size="icon"
              variant="outline"
              className="w-8 h-8 text-muted-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ToolBadgeProps {
  isCalling: boolean;
  brandColor: string;
  Icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  callingText: string;
  completedText: string;
}

const ToolBadge = memo(
  ({
    isCalling,
    brandColor,
    Icon,
    callingText,
    completedText,
  }: ToolBadgeProps) => (
    <div
      className={clsx(
        "inline-flex items-center gap-2 mr-2 text-sm rounded-full my-2 transition-all duration-300 ease-in-out",
        isCalling ? "px-0 py-0" : "px-3 py-1.5 border",
      )}
      style={{
        backgroundColor: isCalling ? "transparent" : `${brandColor}10`,
        borderColor: isCalling ? "transparent" : `${brandColor}40`,
        color: brandColor,
      }}
    >
      {isCalling ? (
        <div className="flex gap-2 items-center animate-in fade-in">
          <Icon
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
            {callingText}
          </TextShimmer>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm md:text-sm">
          <Icon className="w-4 h-4" />
          {completedText}
        </div>
      )}
    </div>
  ),
);

ToolBadge.displayName = "ToolBadge";

interface MessagePartsProps {
  parts: IChatMessage["parts"];
  isLast: boolean;
}

const MessageParts = memo(({ parts, isLast }: MessagePartsProps) => {
  const hasPendingToolCall =
    isLast &&
    parts?.some((part, index) => {
      const nextParts = parts.slice(index + 1);
      const hasSubsequentText = nextParts.some(
        (p) => p.type === "text" && p.text && p.text.length > 0,
      );

      if (part.type?.startsWith("tool-")) {
        return !hasSubsequentText;
      }

      if (part.type === "dynamic-tool") {
        const toolPart = part as { state?: string };
        const isToolCalling =
          toolPart.state === "call" || toolPart.state === "partial-call";
        return isToolCalling && !hasSubsequentText;
      }

      return false;
    });

  return (
    <>
      {parts?.map((part, index) => {
        if (part.type === "text") {
          return (
            <div
              key={index}
              className="text-sm md:text-base prose prose-sm md:prose-base max-w-none leading-loose prose-p:mt-0  prose-p:last:mb-0"
            >
              <Streamdown components={streamdownComponents}>
                {part.text}
              </Streamdown>
            </div>
          );
        }

        return null;
      })}
      {hasPendingToolCall && <MessageLoading style={{ padding: 0 }} />}
    </>
  );
});

MessageParts.displayName = "MessageParts";

const streamdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-2"
    >
      {children}
    </a>
  ),
};

const LoadingIndicator = memo(() => (
  <div className="flex justify-start">
    <div
      className={clsx(
        "max-w-[90%] md:max-w-[75%] leading-7",
        getMessageStyle(
          {
            id: "loading",
            role: "assistant",
            parts: [{ type: "text", text: "" }],
          } as UIMessage,
          "assistant",
        ),
      )}
    >
      <MessageLoading />
    </div>
  </div>
));

LoadingIndicator.displayName = "LoadingIndicator";

interface AssistantMessageProps {
  message: IChatMessage;
  isLast: boolean;
}

const AssistantMessage = memo(({ message, isLast }: AssistantMessageProps) => (
  <div>
    <div className="flex justify-start">
      <div
        className={clsx(
          "max-w-[90%] md:max-w-[75%]",
          getMessageStyle(message, "assistant"),
        )}
      >
        <MessageParts parts={message.parts} isLast={isLast} />
      </div>
    </div>
    {isLast && (
      <div className="flex items-center gap-2 max-w-[90%] md:max-w-[75%] w-full mt-2 px-2">
        <p className="text-xs text-muted-foreground">
          {formatTime(message.metadata?.createdAt ?? "")}
        </p>
      </div>
    )}
  </div>
));

AssistantMessage.displayName = "AssistantMessage";

interface UserMessageProps {
  message: IChatMessage;
  brandColor: string;
  fontColor: string;
}

const UserMessage = memo(
  ({ message, brandColor, fontColor }: UserMessageProps) => (
    <div className="flex justify-end">
      <div
        className={clsx(
          "max-w-[90%] md:max-w-[75%]",
          getMessageStyle(message, "user"),
        )}
        style={{ backgroundColor: brandColor, color: fontColor }}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text")
            return <p key={i} className="text-sm md:text-base whitespace-pre-wrap leading-loose">{part.text}</p>;
          if (part.type === "file" && part.mediaType?.startsWith("image/"))
            return <img key={i} src={part.url} alt="image" className="rounded-lg max-w-full max-h-60 object-contain" />;
          return null;
        })}
      </div>
    </div>
  ),
);

UserMessage.displayName = "UserMessage";

interface SystemMessageProps {
  message: IChatMessage;
}

const SystemMessage = memo(({ message }: SystemMessageProps) => null);

SystemMessage.displayName = "SystemMessage";
