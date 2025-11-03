"use client";

import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatRequestOptions, DefaultChatTransport } from "ai";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
} from "@/lib/types/session";
import { MessageList } from "../chat/message-list";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowDown, RotateCcw } from "lucide-react";
import { ChatInput } from "../chat/chat-input";
import trainService from "@/lib/services/train-services";
import {
  getLocalTrainSession,
  saveLocalTrainSession,
} from "../chat/chat-utils";
import {
  useTrainingSessionActions,
  useTrainingSessions,
} from "@/lib/hooks/training/use-training-sessions";

export default function TrainTab() {
  const { wid } = useParams() as { wid: string };
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const sidRef = useRef<string | null>(null);
  useTrainingSessions(wid);
  const { createSession } = useTrainingSessionActions(wid);

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [
      {
        id: "Initial-agent-message",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Hello there! How can I help you today?",
          },
        ],
      },
    ],
    transport: new DefaultChatTransport({
      api: "/api/train-stream",
      body: { wid },
    }),

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
      setMessages((prev) => [...prev, aimsg] as any);
    },
    onFinish: (evt) => {
      const aimsg = evt.message as unknown as IChatMessage;
      const prevMessages = evt.messages.slice(0, -1);
      setMessages([...prevMessages, aimsg] as any);
      const currentSid = sidRef.current;
      if (wid && currentSid) {
        trainService.saveTrainingMessage(wid, currentSid, aimsg);
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
    trainService.saveTrainingMessage(wid, currentSid, userMsg);
  };

  useEffect(() => {
    const init = async () => {
      if (!wid) return;
      let localSid = getLocalTrainSession(wid);
      if (!localSid) {
        const session = await trainService.createTrainingSession(wid);
        localSid = session.id;
        saveLocalTrainSession(wid, localSid);
      }
      sidRef.current = localSid;
      const existing = await trainService.getTrainingSession(localSid, wid);
      if (existing?.messages?.length) {
        setMessages(existing.messages as any);
      }
    };
    init();
  }, [wid, setMessages]);

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

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className=" flex-1 w-full h-full flex justify-center items-center ">
      <div className="relative">
        <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="h-[75vh] aspect-[9/16] max-h-[900px] min-h-[500px]">
              <div
                className={`h-full flex flex-col overflow-hidden relative mx-auto  `}
              >
                <div className="border-b border-border bg-card px-6 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
                        alt="Agent"
                        className="h-8 w-8 rounded-full object-cover"
                      />

                      <div>
                        <h1 className="text-lg font-semibold text-foreground">
                          Agent Training
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Manage your training sessions
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={"ghost"}
                      onClick={async () => {
                        if (!wid) return;
                        const newSession = await createSession.mutateAsync();
                        sidRef.current = newSession.id;
                        saveLocalTrainSession(wid, newSession.id);
                        setMessages([]);
                      }}
                      aria-label="Create new training chat"
                      disabled={status === "streaming"}
                      size="icon"
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto " ref={messageListRef}>
                  <MessageList
                    heightClassName=" "
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

                <ChatInput
                  input={input}
                  handleSubmit={handleChatSubmit}
                  handleInputChange={(e) => setInput(e.target.value)}
                  status={status}
                  isWidget={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center lg:justify-start"></div>
    </div>
  );
}
