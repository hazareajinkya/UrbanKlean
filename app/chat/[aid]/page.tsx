"use client";

import { useChat } from "@ai-sdk/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatRequestOptions, DefaultChatTransport, UIMessage } from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { IAgent } from "@/lib/types/agent";
import { v4 } from "uuid";
import { useSession } from "@/lib/hooks/session/use-session";
import { getGreetingMsg, initChat } from "@/components/chat/chat-utils";
import chatService from "@/lib/services/chat-service";
import {
  defaultAImessage,
  defaultUserMessage,
  IChatMessage,
  ISession,
} from "@/lib/types/session";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowDownNarrowWide, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getContrastingColor } from "@/lib/utils";
import z from "zod";

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Check if running in widget mode
  const isWidget = searchParams.get("widget") === "true";

  const { agent } = useAgent(aid);
  const { session } = useSession(aid);

  const { messages, sendMessage, setMessages, status } = useChat({
    id: session?.id,
    messages: agent ? [getGreetingMsg(agent)] : [],
    transport: new DefaultChatTransport({
      api: "/api/query-stream",
      body: { aid },
    }),

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
      setMessages((prev) => [...prev, aimsg]);
    },
    onFinish: (messages) => {
      messages.message.metadata = { createdAt: new Date().toISOString() };
      const aimsg = messages.message as IChatMessage;
      const prevMessages = messages.messages.slice(0, -1);
      setMessages([...prevMessages, aimsg]);

      chatService.saveMessage(aid, session!.id, aimsg);
    },
  });

  const handleChatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options: ChatRequestOptions
  ) => {
    e.preventDefault();
    console.log("session1: ", session);

    if (!input.trim() || !aid || !agent) return;

    const msg = defaultUserMessage(input);
    sendMessage({
      text: input,
      metadata: { createdAt: new Date().toISOString() },
    });
    chatService.saveMessage(aid, session!.id, msg);
    setInput("");
  };

  useEffect(() => {
    if (agent) {
      initChat(agent);
    }
  }, [aid, agent]);

  useEffect(() => {
    if (session) {
      session.messages.length > 0 && setMessages(session.messages);
    }
  }, [session]);

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

  // Add widget-specific styles and effects
  useEffect(() => {
    if (isWidget) {
      // Notify parent window that widget is ready
      window.parent.postMessage({ type: "MAGICALCX_WIDGET_READY" }, "*");

      // Add widget-specific styling
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.margin = "";
        document.body.style.padding = "";
        document.body.style.overflow = "";
      };
    }
  }, [isWidget]);

  if (!agent) return <div>Agent not found</div>;
  return (
    <div
      className={`h-full flex flex-col overflow-hidden bg-white relative ${
        isWidget ? "h-screen" : "max-w-4xl mx-auto"
      }`}
    >
      <ChatHeader agent={agent!} isWidget={isWidget} />

      <div className="flex-1 overflow-y-auto" ref={messageListRef}>
        <MessageList
          agent={agent!}
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
            className={`absolute z-10 ${
              isWidget ? "bottom-24 right-4" : "bottom-24 right-4"
            }`}
          >
            <Button
              onClick={scrollToBottom}
              size="icon"
              variant={"outline"}
              className="w-8 h-8 text-muted-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatInput
        agent={agent!}
        input={input}
        handleSubmit={handleChatSubmit}
        handleInputChange={(e) => setInput(e.target.value)}
        status={status}
        isWidget={isWidget}
      />
    </div>
  );
}
