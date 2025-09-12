"use client";

import { Streamdown } from "streamdown";
import { UIMessage } from "@ai-sdk/react";
import { getContrastingColor } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ChatStatus } from "ai";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { IAgent } from "@/lib/types/agent";
import { Globe } from "lucide-react";

interface MessageListProps {
  agent: IAgent;
  messages: UIMessage[];
  status: ChatStatus;
}

export const MessageList = ({ messages, status, agent }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(messages.length);
  const showLoadingIndicator = status === "submitted";

  const brandColor = agent.customization.primaryColor;
  const fontColor = getContrastingColor(brandColor);

  useEffect(() => {
    const currentMessageCount = messages.length;
    const hasNewMessage = currentMessageCount > previousMessageCountRef.current;

    if (hasNewMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
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
                        console.log("part: ", part);

                        if (part.type === "tool-searchKnowledge") {
                          // const toolStatus = part.toolInvocation.state;
                          // const toolName = part.toolInvocation.toolName;
                          const isCalling = part.state !== "output-available";
                          // const { displayName, Icon } = getToolDisplayName(
                          //   toolName,
                          //   toolStatus
                          // );
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
                        if (part.type === "text") {
                          return (
                            <div key={index}>
                              <div
                                className="text-sm md:text-base prose prose-sm md:prose-base max-w-none leading-loose "
                                key={index}
                              >
                                <Streamdown
                                // remarkPlugins={[remarkGfm, remarkToc]}
                                // rehypePlugins={[rehypeRaw]}
                                // components={{
                                //   code: ({ children, className }) => (
                                //     <CodeBlock
                                //       value={children as string}
                                //       language={
                                //         className?.split("-")[1] || "js"
                                //       }
                                //     />
                                //   ),
                                //   pre: ({ children }) => (
                                //     <div className="bg-secondary p-2 rounded-lg">
                                //       {children}
                                //     </div>
                                //   ),
                                //   a: ({ href, children }) => (
                                //     <a
                                //       href={href}
                                //       target="_blank"
                                //       rel="noopener noreferrer"
                                //       className="text-primary hover:text-primary/80 transition-colors"
                                //     >
                                //       {children}
                                //     </a>
                                //   ),
                                // }}
                                >
                                  {part.text}
                                </Streamdown>
                              </div>
                              {/* {isLastAssistantMessage &&
                                suggestions.length > 0 && (
                                  <div className="mt-4">
                                    <div
                                      className="flex flex-wrap gap-2"
                                      key={`suggestions-${suggestions.length}`}
                                    >
                                      {suggestions.map(
                                        (suggestion, suggestionIndex) => (
                                          <motion.button
                                            key={`${suggestionIndex}-${suggestion}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                              duration: 0.2,
                                              delay: suggestionIndex * 0.06,
                                              ease: "easeOut",
                                            }}
                                            onClick={() =>
                                              onSuggestionClick?.(suggestion)
                                            }
                                            className="px-3 py-1.5 md:px-3 md:py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer slide-in-from-bottom "
                                          >
                                            {suggestion}
                                          </motion.button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )} */}
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

              <div className={`${isLastAssistantMessage && heightClass}`}></div>
            </div>
          );
        })}

        {showLoadingIndicator && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="flex justify-start "
          >
            <div
              className={`max-w-[75%] ${heightClass} py-0 text-foreground rounded-lg`}
            >
              <TextShimmer
                className="text-sm md:text-base leading-loose"
                style={
                  {
                    "--base-color": brandColor,
                    "--base-gradient-color": "#eeeeee", // 20% opacity
                  } as React.CSSProperties
                }
                duration={1.5}
                spread={1.5}
              >
                Generating response...
              </TextShimmer>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};

const heightClass = `min-h-[calc(100vh-19rem)] md:min-h-[calc(100vh-20rem)]`;

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
