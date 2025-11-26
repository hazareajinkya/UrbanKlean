"use client";

import { useChat } from "@ai-sdk/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChatRequestOptions,
  DefaultChatTransport,
  ToolUIPart,
  UIMessage,
} from "ai";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { IAgent } from "@/lib/types/agent";
import { v4 } from "uuid";
import { sessionKey, useSession } from "@/lib/hooks/session/use-session";
import {
  getGreetingMsg,
  getLocalDeviceId,
  initChat,
} from "@/components/chat/chat-utils";
import chatService from "@/lib/services/chat-service";
import {
  defaultAImessage,
  defaultDataMessage,
  defaultUserMessage,
  IChatMessage,
  ISession,
} from "@/lib/types/session";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowDownNarrowWide, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getContrastingColor } from "@/lib/utils";
import z from "zod";
import peopleService from "@/lib/services/people-service";
import { IPerson } from "@/lib/types/person";
import { queryClient } from "@/lib/clients/query-client";

export default function ChatPage() {
  const { aid } = useParams() as { aid: string };
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [deviceId, setDeviceId] = useState<string>();

  const lastToolRef = useRef<string | null>(null);

  // Check if running in widget mode
  const isWidget = searchParams.get("widget") === "true";

  const { agent } = useAgent(aid);
  const { session, updateSession } = useSession(aid);

  const getPersonId = () => {
    if (session?.personId) {
      return session.personId;
    }
    return undefined;
  };

  const { messages, sendMessage, setMessages, status } = useChat<IChatMessage>({
    id: `${session?.id}`,
    messages: agent ? [getGreetingMsg(agent)] : [],
    transport: new DefaultChatTransport({
      api: "/api/query-stream",
      body: () => {
        const deviceId = agent ? getLocalDeviceId(agent.wid) : undefined;
        const cachedSession = session?.id
          ? queryClient.getQueryData<ISession>(sessionKey(session.id))
          : undefined;

        return {
          aid,
          deviceId: deviceId,
          personId: cachedSession?.personId,
        };
      },
    }),
    onData: (data) => {
      console.log("data: ", data);
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall?.toolCallId) {
        lastToolRef.current = toolCall.toolCallId;
      }
    },

    onError: (error) => {
      console.error("Error: ", error);
      const aimsg = defaultAImessage("Error: " + error.message);
      setMessages((prev) => [...prev, aimsg]);
    },
    onFinish: (messages) => {
      const lastMessage = messages.messages[
        messages.messages.length - 1
      ] as IChatMessage;

      const lastTool = lastMessage.parts?.find(
        (part) => part.type === "tool-collectInformation"
      ) as ToolUIPart;

      if (lastTool?.toolCallId && lastToolRef.current === lastTool.toolCallId) {
        lastToolRef.current = null;
        const person = (lastTool.output as { person: IPerson })?.person;
        if (person) {
          updateSession({ ...session!, personId: person.id });
        }
      }
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

  // const initChatMessages = async (agent: IAgent) => {
  //   const deviceId = await initChat(agent);
  //   const dataMsg = defaultDataMessage({ deviceId });
  //   setMessages([getGreetingMsg(agent), dataMsg]);
  //   console.log("messages: ", messages);
  // };

  useEffect(() => {
    if (agent) {
      initChat(agent).then((did) => setDeviceId(did));
    }
  }, [aid, agent]);

  useEffect(() => {
    if (!session) return;
    if (!agent) return;

    console.log("checking if session has personId:");

    if (session) {
      // const dataMsg = defaultDataMessage({ deviceId });
      // setMessages((prev) => [...prev, dataMsg]);

      if (session.messages.length > 0) {
        setMessages((prev) => [...prev, ...session.messages]);
      }

      if (session.personId) {
        console.log("ruuning person check: ");

        peopleService.getPerson(agent.wid, session.personId).then((person) => {
          console.log("person: ", person);
          if (person) {
            setMessages((prev) => [defaultDataMessage(person), ...prev]);
          }
        });
      }
    }
  }, [session, agent]);

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
